const { request } = require('express');
const express = require('express');
const router = express.Router();
const userService = require('../services/users.service');

// routes
router.post('/authenticate', authenticate);
router.post('/register', register);
router.get('/', getAll);
router.get('/current', getCurrent);
router.get('/:id', getById);
router.put('/:id', update);
router.delete('/:id', _delete);
router.post('/verify-email', verifyEmail);
router.post('/verify-phone', verifyPhone);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/resend-verify-email', resendVerifyEmail);


module.exports = router;

function authenticate(req, res, next) {
    userService.authenticate(req.body)
        .then(user => user ? res.json(user) : res.status(401).json({ message: 'email or password is incorrect' }))
        .catch(err => next(err));
}

function register(req, res, next) {
    userService.createUser(req.body)
        .then(() => res.json({}))
        .catch(err => next(err));
}

function verifyEmail(req, res, next) {
    userService.verifyEmail(req.body)
    .then(response => response === "failure" ? res.status(500).json({ message: 'verification failed' }) : res.json({ message: 'verification success' }))
        .catch(next);
}

function verifyPhone(req, res, next) {
    userService.verifyPhone(req.body)
    .then(response => response === "failure" ? res.status(500).json({ message: 'failed' }) : res.json({ message: 'success' }))
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