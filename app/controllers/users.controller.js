const { request } = require('express');
const express = require('express');
const router = express.Router();
const userService = require('../services/users.service');
const jwt = require('jsonwebtoken');
const config = require('../config.json');

// routes
router.post('/authenticate', authenticate);
router.post('/register', register);
router.post('/getUser', getUser);
router.get('/', getAll);
router.get('/current', getCurrent);
router.get('/:id', getById);
router.put('/:id', update);
router.delete('/:id', _delete);
router.post('/verify-email', verifyEmail);
router.post('/verify-phone', verifyPhone);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/change-password', changePassword);
router.post('/deactivateAccount', deactivateAccount);
router.post('/deleteAccount', deleteAccount);
router.post('/resend-verify-email', resendVerifyEmail);
router.post('/refreshToken', refreshToken);
router.post('/logout',logout);


module.exports = router;

function authenticate(req, res, next) {
    userService.authenticate(req.body)
        .then(user => {
            if(user && user.userDetails) {
                setTokenCookie(res, user.userDetails.tokenDetails.refreshToken);
                const tokenDetails = user.userDetails.tokenDetails.accessToken;
                user.userDetails.tokenDetails = { accessToken: tokenDetails };
                res.json(user)
            }
            else {
                res.status(401).json({ message: 'email or password is incorrect' })
            }
        })
        .catch(err => next(err));
}

function register(req, res, next) {
    userService.createUser(req.body)
        .then(() => res.json({}))
        .catch(err => next(err));
}

function logout(req, res, next) {
    userService.logout(req.body)
    .then(response => {
        if(response === "failure")
         {
            res.clearCookie("refreshToken");
            res.status(500).json({ message: 'logout failed' });
         }  else {
            res.clearCookie("refreshToken");
            res.json({ message: 'logout success' });
         } 
    })
    .catch(next);
}

function getUser(req, res, next) {
    userService.getUser(req.body)
    .then((user) => res.json(user))
    .catch(err => next(err));
}

function verifyEmail(req, res, next) {
    userService.verifyEmail(req.body)
    .then(response => response === "failure" ? res.status(500).json({ message: 'verification failed' }) : res.json({ message: 'verification success' }))
        .catch(next);
}

function verifyPhone(req, res, next) {
    userService.verifyPhone(req.body)
    .then(response => {
        (response === "failure") ? res.status(500).json({ message: 'verification failed' }) : (response.Status === "Error" ? res.status(500).json({ message: response }) :  res.json({ message: response }));
    })
    .catch(next);
}

function resendVerifyEmail(req, res, next) {
    userService.resendVerificationEmail(req.body.email)
        .then(() => res.json({ message: 'verifcation code send' }))
        .catch(next);
}

function forgotPassword(req, res, next) {
    userService.forgotPassword(req.body, req.get('origin'))
        .then(response => response === "failure" ? res.status(401).json({ message: 'email is incorrect' }) : res.json({ message: 'Please check your email for password reset instructions' }))
        .catch(next);
}

function resetPassword(req, res, next) {
    userService.resetPassword(req.body)
        .then(response => response === "failure" ? res.status(401).json({ message: 'Temporary password is incorrect' }) : res.json({ message: 'Password reset successful, you can now login' }))
        .catch(next);
}

function changePassword(req, res, next) {
    userService.changePassword(req.body)
        .then(response => response === "failure" ? res.status(401).json({ message: 'Current password is incorrect' }) : res.json({ message: 'change password successful, you can now login' }))
        .catch(next);
}

function deactivateAccount(req, res, next) {
    userService.deactivateAccount(req.body)
    .then(() => {
        res.clearCookie("refreshToken");
        res.json({})
    })
    .catch(err => next(err));
}

function deleteAccount(req, res, next) {
    userService.deleteAccount(req.body)
    .then(() => {
        res.clearCookie("refreshToken");
        res.json({})
    })
    .catch(err => next(err));
}

function getAll(req, res, next) {
    userService.getAll()
        .then(users => res.json(users))
        .catch(err => next(err));
}

function getCurrent(req, res, next) {
    userService.getById(req.user.sub)
        .then(user => user ? res.json(user) : res.sendStatus(404))
        .catch(err => next(err));
}

function getById(req, res, next) {
    userService.getById(req.params.id)
        .then(user => user ? res.json(user) : res.sendStatus(404))
        .catch(err => next(err));
}


function update(req, res, next) {
    userService.update(req.params.id, req.body)
        .then(() => res.json({}))
        .catch(err => next(err));
}

function _delete(req, res, next) {
    userService.delete(req.params.id)
        .then(() => res.json({}))
        .catch(err => next(err));
}

function refreshToken(req, res, next) {
    userService.refreshToken(req.body)
        .then(user => {
            if(user) {
                setTokenCookie(res, user.userDetails.tokenDetails.refreshToken);
                const tokenDetails = user.userDetails.tokenDetails.accessToken;
                user.userDetails.tokenDetails = { accessToken: tokenDetails };
                res.json(user)
            }
            else {
                res.status(401).json({ message: 'Email or password is incorrect' })
            }
        })
        .catch(err => next(err));
}

// helper functions

function setTokenCookie(res, token)
{
    // create cookie with refresh token that expires in 7 days
    const cookieOptions = {
        httpOnly: true,
        expires: new Date(Date.now() + 7*24*60*60*1000)
    };
    res.cookie('refreshToken', token, cookieOptions);
    // res.header('Access-Control-Allow-Origin', 'http://localhost:8080');
    // res.header('Access-Control-Allow-Credentials','true');
}

function authenticateJWT (req, res, next) {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1];

        jwt.verify(token, config.secret, (err, user) => {
            console.log(err);
            if (err) {
                return res.sendStatus(403);
            }

            req.user = user;
            next();
        });
    } else {
        res.sendStatus(401);
    }
};