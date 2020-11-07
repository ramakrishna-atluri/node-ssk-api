const config = require('../config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require("crypto");
const db = require('../helpers/db');
const counterService = require('./counter.service');
const sendEmail = require('../helpers/send-email');
const User = db.User;
const RefreshToken = db.RefreshToken;

module.exports = {
    authenticate,
    getAll,
    getById,
    createUser,
    update,
    delete: _delete,
    getUserSequenceNumber,
    revokeToken,
    refreshToken,
    verifyEmail,
    forgotPassword,
    resetPassword
};

async function authenticate({ email, password, ipAddress }) {
    const user = await User.findOne({ email });
    if (!user || !bcrypt.compareSync(password, user.hash)) {
        throw 'Email or password is incorrect';
    }

    // authentication successful so generate jwt and refresh tokens
    const jwtToken = generateJwtToken(user);
    const refreshToken = generateRefreshToken(user, ipAddress);

    // save refresh token
    await refreshToken.save();

    // return basic details and tokens
    return {
        ...basicDetails(user),
        ...tokenDetails(jwtToken, refreshToken.token)
    };
}

async function refreshToken({ token, ipAddress }) {
    const refreshToken = await getRefreshToken(token);
    const { user } = refreshToken;

    // replace old refresh token with a new one and save
    const newRefreshToken = generateRefreshToken(user, ipAddress);
    refreshToken.revoked = Date.now();
    refreshToken.revokedByIp = ipAddress;
    refreshToken.replacedByToken = newRefreshToken.token;
    await refreshToken.save();
    await newRefreshToken.save();

    // generate new jwt
    const jwtToken = generateJwtToken(user);

    // return basic details and tokens
    return {
        ...basicDetails(user),
        ...tokenDetails(jwtToken, newRefreshToken.token)
    };
}

function basicDetails(user) {
    const { email, roleId, userId, isProfileComplete, createdBy, isActive,  isVerified } = user;
    return { email, roleId, userId, isProfileComplete, createdBy, isActive,  isVerified };
}

function tokenDetails(jwtToken, newRefreshToken) {
    return {
        accessToken: jwtToken,
        refreshToken: newRefreshToken
    }
}

function generateJwtToken(user) {
    // create a jwt token containing the user id that expires in 15 minutes
    return jwt.sign({ email: user.email, password: user.password }, config.secret, { expiresIn: '15m' });
}

function generateRefreshToken(user, ipAddress) {
    // create a refresh token that expires in 7 days
    return new RefreshToken({
        user: user.id,
        token: randomTokenString(),
        expires: new Date(Date.now() + 7*24*60*60*1000),
        createdByIp: ipAddress
    });
}

function randomTokenString() {
    return crypto.randomBytes(10).toString('hex');
}

async function getRefreshToken(token) {
    const refreshToken = await RefreshToken.findOne({ token }).populate('user');
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

async function sendVerificationEmail(user, origin) {
    let message;
    if (origin) {
        const verifyUrl = `${origin}/users/verify-email?token=${user.verificationToken}`;
        message = `<p>Please click the below link to verify your email address:</p>
                   <p><a href="${verifyUrl}">${verifyUrl}</a></p>`;
    } else {
        message = `<p>Please use the below token to verify your email address with the <code>/user/verify-email</code> api route:</p>
                   <p><code>${user.verificationToken}</code></p>`;
    }

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

async function createUser(userParam, origin) {
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
    user.userId = counter;
    user.roleId = 1;
    user.createdBy = !userParam.mediatorId ? user.userId : userParam.mediatorId;
    user.isTemporaryPassword = userParam.mediatorId ? true : false;
    user.verificationToken = randomTokenString();
      
    // save user
    await user.save();

    // send email
    await sendVerificationEmail(user, origin);
}

async function update(id, userParam) {
    const user = await User.findById(id);

    // validate
    if (!user) throw 'User not found';
    if (user.email !== userParam.email && await User.findOne({ email: userParam.email })) {
        throw 'email "' + userParam.email + '" is already taken';
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

    if (!user) throw 'Verification failed';

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();
}

async function forgotPassword({ email }, origin) {
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
    await sendPasswordResetEmail(user, origin);
}

async function sendPasswordResetEmail(user, origin) {
    let message;
    if (origin) {
        const resetUrl = `${origin}/users/reset-password?token=${user.resetToken.token}`;
        message = `<p>Please click the below link to reset your password, the link will be valid for 1 day:</p>
                   <p><a href="${resetUrl}">${resetUrl}</a></p>`;
    } else {
        message = `<p>Please use the below token to reset your password with the <code>/users/reset-password</code> api route:</p>
                   <p><code>${user.resetToken.token}</code></p>`;
    }

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
       //const resetUrl = `${origin}/users/reset-password?token=${user.resetToken.token}`;
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

async function _delete(id) {
    await User.findByIdAndRemove(id);
}


