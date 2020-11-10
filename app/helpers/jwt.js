const expressJwt = require('express-jwt');
const config = require('../config.json');
const userService = require('../services/users.service');

module.exports = jwt;

function jwt() {
    const secret = config.secret;
    return expressJwt({ secret, algorithms: ['HS256'], isRevoked }).unless({
        path: [
            // public routes that don't require authentication
            '/users/authenticate',
            '/profile/createProfile',
            '/counter/createCounter',
            '/users/register',
            '/users/verify-email',
            '/users/forgot-password',
            '/users/reset-password'
        ]
    });
}

async function isRevoked(req, payload, done) {
    const user = await userService.getById(payload.sub);

    // revoke token if user no longer exists
    if (!user) {
        return done(null, true);
    }

    done();
};