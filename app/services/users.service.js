const config = require('../config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require("crypto");
const db = require('../helpers/db');
const counterService = require('./counter.service');
const sendEmail = require('../helpers/send-email');
const { sendOTP, verifyOTP} = require('../helpers/verify-phone');
const { response } = require('express');
const userProfileService = require('./userProfile.service')
const User = db.User;
const UserProfile = db.UserProfile;
const UserPreferences= db.UserPreferences;
const RefreshToken = db.RefreshToken;

module.exports = {
    authenticate,
    getUser,
    logout,
    getAll,
    getById,
    createUser,
    update,
    delete: _delete,
    getUserSequenceNumber,
    revokeToken,
    refreshToken,
    verifyEmail,
    verifyPhone,
    forgotPassword,
    resetPassword,
    resendVerificationEmail,
    changePassword,
    deactivateAccount,
    deleteAccount
};

async function authenticate({ email, password, ipAddress }) {

    const user = await User.findOne({ email });
    if (!user || !bcrypt.compareSync(password, user.hash)) {
        return 'Email or password is incorrect';
    }

    // authentication successful so generate jwt and refresh tokens
    const jwtToken = generateJwtToken(user);
    const refreshToken = generateRefreshToken(user.userId, ipAddress);

    if(!user.isActive) {
        user.isActive = true;

        await user.save();

        sendAccountActivationEmail(user);
    }
        
    // save refresh token
    await refreshToken.save();

    const userDetailParams = basicDetails(user);
    userDetailParams.tokenDetails = tokenDetails(jwtToken, refreshToken.token);

    let body = {
        userDetails : userDetailParams
    }

    return body;
}

async function getUser({ userId }) {
    const user = await User.findOne({ userId });
   
    let userProfileParams = await UserProfile.findOne({userId : user.userId});
    if(userProfileParams)
        userProfileParams.contactInfo.contactNumber = userProfileParams.contactInfo.maskedContactNumber;
        userProfileParams.contactInfo.email = userProfileParams.contactInfo.maskedEmail;

    const userPreferenceParams = await UserPreferences.findOne({userId : user.userId});
    let matchObj = [];
    if(userPreferenceParams){
        const matchObj1 = await userProfileService.getMatches({userId});        
        
        matchObj1.forEach((profile, i) => {
            profile.contactInfo.contactNumber = profile.contactInfo.maskedContactNumber;
            profile.contactInfo.email = profile.contactInfo.maskedEmail;
            matchObj.push(profile);
        });
    }

    let body = {
        userProfile : userProfileParams,
        userPreferences : userPreferenceParams,
        matchList: matchObj
    }
    return body;
}

async function logout({userId}){
    await RefreshToken.deleteMany({userId: userId}), function (err) {
        if(err) return 'failure';
        
        return 'success';
    }
}

async function refreshToken(token, { userId, ipAddress }) {
    const refreshToken = await getRefreshToken(token);
    const user = await User.findOne({ userId });

    // replace old refresh token with a new one and save
    const newRefreshToken = generateRefreshToken(userId, ipAddress);
    refreshToken.revoked = Date.now();
    refreshToken.revokedByIp = ipAddress;
    refreshToken.replacedByToken = newRefreshToken.token;
    await refreshToken.save();
    await newRefreshToken.save();

    // generate new jwt
    const jwtToken = generateJwtToken(user);

    const userDetailParams = basicDetails(user);
    userDetailParams.tokenDetails = tokenDetails(jwtToken, newRefreshToken.token);

    let body = {
        userDetails : userDetailParams
    }
    return body;
}

function basicDetails(user) {
    const { maskedEmail, roleId, userId, isProfileComplete, profileCompletePercentage, createdBy, isActive,  isVerified,  expiresIn } = user;
    return { email: maskedEmail, roleId, userId, isProfileComplete, profileCompletePercentage, createdBy, isActive,  isVerified , expiresIn};
}

function tokenDetails(jwtToken, newRefreshToken) {
    return {
        accessToken: jwtToken,
        refreshToken: newRefreshToken
    }
}

function generateJwtToken(user) {
    // create a jwt token containing the user id that expires in 15 minutes
    return jwt.sign({ email: user.email }, config.secret, { expiresIn: '15m' });
}

function generateRefreshToken(userId, ipAddress) {
    // create a refresh token that expires in 7 days
    return new RefreshToken({
        userId: userId,
        token: randomTokenString(),
        expires: new Date(Date.now() + 7*24*60*60*1000),
        createdByIp: ipAddress
    });
}

function randomTokenString() {
    return crypto.randomBytes(40).toString('hex');
}

function randomEmailOTP(){
    let num = Math.floor((Math.random() * 1000000))
    if(num<10000){
        num = num*10;
    }
    return num;
}
async function getRefreshToken(token) {
    const refreshToken = await RefreshToken.findOne({ token });
    if (!refreshToken || !refreshToken.isActive) throw 'Invalid token';
    return refreshToken;
}

async function revokeToken({ token, ipAddress }) {
    const refreshToken = await getRefreshToken(token);

    // revoke token and save
    refreshToken.revoked = Date.now();
    refreshToken.revokedByIp = ipAddress;
    await refreshToken.save();
}

async function sendAccountActivationEmail(user) {
    let message = `<p>Your account with this email has been re-activated due to login`;
    
    await sendEmail({
        to: user.email,
        subject: 'SSK Matrimonial - Account Activation Email',
        html: `<h4>Account Activation Email</h4>
               <p>Welcome back!!</p>
               ${message}`
    });
}

async function sendVerificationEmail(user) {
    let message = `<p>Please use the below token to verify your email address.
                <p><code>${user.verificationToken}</code></p>`;
    
    await sendEmail({
        to: user.email,
        subject: 'SSK Matrimonial - Verify Email',
        html: `<h4>Verify Email</h4>
               <p>Thanks for registering!</p>
               ${message}`
    });
}

async function resendVerificationEmail(userId) {
    const user = await User.findOne({ userId: userId })
    user.verificationToken = randomEmailOTP();
    await user.save();

    let message;
        message = `<p>Please use the below token to verify your email address with the <code>/user/verify-email</code> api route:</p>
                   <p><code>${user.verificationToken}</code></p>`;

    await sendEmail({
        to: user.email,
        subject: 'SSK Matrimonial - Verify Email',
        html: `<h4>Verify Email</h4>
               <p>Thanks for registering!</p>
               ${message}`
    });

}

async function getAll() {
    return await User.find();
}

async function getById(id) {
    return await User.findById(id);
}

async function getUserSequenceNumber(userParam) {
    const user = await User.findOne({ email: userParam });
    return user.userId;
}

async function createUser(userParam) {
    // validate
    if (await User.findOne({ email: userParam.email })) {
        throw 'email "' + userParam.email + '" is already taken';
    }

    const user = new User(userParam);

    // hash password
    if (userParam.password) {
        user.hash = bcrypt.hashSync(userParam.password, 10);
    }
    user.status = true;
    var counter = await counterService.updateCounter("userId");
    user.userId = 'SSK' + counter;
    user.roleId = 1;
    user.createdBy = !userParam.mediatorId ? user.userId : userParam.mediatorId;
    user.isTemporaryPassword = userParam.mediatorId ? true : false;
    user.verificationToken = randomEmailOTP();
    user.maskedEmail = userParam.email.replace(/^(.)(.*)(.@.*)$/, (_, a, b, c) => a + '******' + c);
    user.expiresIn = new Date(Date.now() + 90*24*60*60*1000);
      
    // save user
    await user.save();

    // send email
    await sendVerificationEmail(user);
}

async function update(id, userParam) {
    const user = await User.findById(id);

    // validate
    if (!user) throw 'User not found';
    if (user.email !== userParam.email && await User.findOne({ email: userParam.email })) {
        throw 'Email "' + userParam.email + '" is already taken';
    }

    // hash password if it was entered
    if (userParam.password) {
        userParam.hash = bcrypt.hashSync(userParam.password, 10);
    }

    // copy userParam properties to user
    Object.assign(user, userParam);
    await user.save();
}

async function verifyEmail({ token }) {
    const user = await User.findOne({ verificationToken: token });

    if (!user) return 'failure';

    const userProfile = await UserProfile.findOne({ userId: userId }); 
    userProfile.contactInfo.phoneVerified = true;

    user.profileCompletePercentage += 5; 
    if(user.profileCompletePercentage === 100){
        user.isProfileComplete = true;
    }
    user.verificationToken = undefined;

    await user.save();
    await userProfile.save();

    return 'success'
}

async function verifyPhone({ sessionId, userId, action, otpCode }) {

    if(action === null) return 'failure';
    const user = await User.findOne({ userId: userId });
    const userProfile = await UserProfile.findOne({ userId: userId });
    if (!userProfile) return 'failure';

    if(action === 'sendOTP')
    {
        return sendOTP(userProfile.contactInfo.contactNumber)
    }
    else {
        const verifyOTPResponse = JSON.parse(await verifyOTP(otpCode, sessionId));
        if(verifyOTPResponse.Status === 'Success' && verifyOTPResponse.Details === 'OTP Matched'){
            
            userProfile.contactInfo.phoneVerified = true;
            user.profileCompletePercentage += 5;
            if(user.profileCompletePercentage === 100){
                user.isProfileComplete = true;
            }
            await user.save();
            await userProfile.save();
        }
        else {
            return 'failure';
        }

        return verifyOTPResponse;
    }
}

async function forgotPassword({ email }) {
    const user = await User.findOne({ email });

    // always return ok response to prevent email enumeration
    if (!user) return "failure";

    // create reset token that expires after 24 hours
    user.resetToken = {
        token: randomTokenString(),
        expires: new Date(Date.now() + 24*60*60*1000)
    };
    await user.save();

    // send email
    await sendPasswordResetEmail(user);
}

async function changePassword({ userId, currPassword, newPassword }) {
    const user = await User.findOne({ userId: userId });
    if (!bcrypt.compareSync(currPassword, user.hash)) {
        return 'failure';
    }
    // create reset token that expires after 24 hours
    user.hash = bcrypt.hashSync(newPassword,10);
    await user.save();

    await sendResetPasswordConfirmEmail(user);
    
}

async function sendPasswordResetEmail(user) {
    let message = `<p>Please use the below token to reset your password.
                   <p><code>${user.resetToken.token}</code></p>`;

    await sendEmail({
        to: user.email,
        subject: 'Sign-up Verification API - Reset Password',
        html: `<h4>Reset Password Email</h4>
               ${message}`
    });

    return "Success";
}

async function resetPassword({ token, password }) {
    const user = await User.findOne({
        'resetToken.token': token,
        'resetToken.expires': { $gt: Date.now() }
    });

    if (!user) return 'failure';

    // update password and remove reset token
    user.hash = bcrypt.hashSync(password,10);
    // user.passwordReset = Date.now();
    user.resetToken = undefined;
    await user.save();

    await sendResetPasswordConfirmEmail(user);
}

async function sendResetPasswordConfirmEmail(user) {
    let message;
    if (user) {
        message = `<p>Your password has been succesfully reset, please login.</p>`;
    }

    await sendEmail({
        to: user.email,
        subject: 'Sign-up Verification API - Reset Password',
        html: `<h4>Reset Password Confirm Email</h4>
               ${message}`
    });

    return "Success";
}

async function updateCounter(sequenceName) {

    const seqValue = db.counters.findAndModify({
        query:{_id: sequenceName},
        update: {$inc:{sequence_value:1}},
        new:true
    });

    return seqValue.sequence_value;
    //return await Counter.find({counterId: sequenceName});
}

async function deactivateAccount(idParam) {
    const user = await User.findOne({ userId: idParam.userId});

    if (!user) return 'failure';

    // update isActive
    user.isActive = false;
    await user.save();

    await sendDeactivateConfirmEmail(user);
}

async function sendDeactivateConfirmEmail(user) {
    let message;
    if (user) {
        message = `<p>Your Account has been Deactivated and will be not available to others. Please login to activate again.</p>`;
    }

    await sendEmail({
        to: user.email,
        subject: 'Account Deactivation - SSK Matrimonial',
        html: `<h4>Account Deactivation Email:</h4>
               ${message}`
    });

    return "Success";
}

async function deleteAccount(idParam) {
    const user = await User.findOne({ userId: idParam.userId});

    if (!user) return 'failure';
    
    // update isActive
    await UserPreferences.deleteOne({userId: idParam.userId}), function (err) {
        if(err) return 'failure';
        return 'success';
    }
    await UserProfile.deleteOne({userId: idParam.userId}), function (err) {
        if(err) return 'failure';
        return 'success';
    }
    await logout({userId: idParam.userId});

    await sendDeleteConfirmEmail(user);

    await User.deleteOne({userId: idParam.userId})
}

async function sendDeleteConfirmEmail(user) {
    let message;
    if (user) {
        message =  `<p>We are just confirming your account has been deleted. If you'd like to join SSK Matrimonial again, please register at <a href="https://www.sskmatrimonail.com">SSK Matrmimonial</a> </p>` ;
    }

    await sendEmail({
        to: user.email,
        subject: 'Account Deletion - SSK Matrimonial',
        html: `<h4>Account Deletion Email:</h4>
               ${message}`
    });

    return "Success";
}

async function _delete(id) {
    await User.findByIdAndRemove(id);
}



