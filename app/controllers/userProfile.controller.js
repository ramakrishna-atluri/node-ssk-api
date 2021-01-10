const express = require('express');
const router = express.Router();
const userProfileService = require('../services/userProfile.service');

// routes
router.post('/createProfile', createProfile);
router.post('/updateProfile', updateProfile);
router.post('/viewProfile', viewProfile),
router.post('/blockProfile', blockProfile);
router.post('/unblockProfile', unBlockProfile);
router.post('/saveProfile', saveProfile);
router.post('/connectProfile', connectProfile);
router.post('/cancelRequest', cancelRequest);
router.post('/removeProfile', removeProfile);
router.post('/acceptRequest', acceptRequest);
router.post('/rejectRequest', rejectRequest);
router.post('/get-matches', getMatches);
router.post('/get-top-ten-profiles', getTopTenProfiles);
router.post('/get-top-ten-saved-profiles', getTopTenSavedProfiles);

module.exports = router;

function createProfile(req, res, next) {
    userProfileService.createProfile(req.body)
        .then((userProfile) => res.json(userProfile))
        .catch(err => next(err));
}

function updateProfile(req, res, next) {
    userProfileService.updateProfile(req.body)
        .then((userProfile) => res.json(userProfile))
        .catch(err => next(err));
}

function saveProfile(req, res, next) {
    userProfileService.saveProfile(req.body)
        .then((response) => res.json(response))
        .catch(err => next(err));
}

function connectProfile(req, res, next) {
    userProfileService.connectProfile(req.body)
        .then((response) => res.json(response))
        .catch(err => next(err));
}

function cancelRequest(req, res, next) {
    userProfileService.cancelRequest(req.body)
        .then((response) => res.json(response))
        .catch(err => next(err));
}

function removeProfile(req, res, next) {
    userProfileService.removeProfile(req.body)
        .then((response) => res.json(response))
        .catch(err => next(err));
}

function acceptRequest(req, res, next) {
    userProfileService.acceptRequest(req.body)
        .then((response) => res.json(response))
        .catch(err => next(err));
}

function rejectRequest(req, res, next) {
    userProfileService.rejectRequest(req.body)
        .then((response) => res.json(response))
        .catch(err => next(err));
}

function viewProfile(req, res, next) {
    userProfileService.viewProfile(req.body)
        .then((userProfile) => res.json(userProfile))
        .catch(err => next(err));
}

function getMatches(req, res, next) {
    userProfileService.getMatches(req.body)
        .then((matchList) => res.json(matchList))
        .catch(err => next(err));
}

function getTopTenProfiles(req, res, next) {
    userProfileService.getTopTenProfiles(req.body)
        .then((matchList) => res.json(matchList))
        .catch(err => next(err));
}

function getTopTenSavedProfiles(req, res, next) {
    userProfileService.getTopTenSavedProfiles(req.body)
        .then((matchList) => res.json(matchList))
        .catch(err => next(err));
}

function blockProfile(req, res, next) {
    userProfileService.blockProfile(req.body)
    .then(userProfile => {
        if(userProfile) {
            res.json(userProfile)
        }
        else {
            res.status(401).json({ message: 'invalid Profile Id' })
        }
    })
    .catch(err => next(err));
}

function unBlockProfile(req, res, next) {
    userProfileService.unBlockProfile(req.body)
    .then(userProfile => {
        if(userProfile) {
            res.json(userProfile)
        }
        else {
            res.status(401).json({ message: 'invalid Profile Id' })
        }
    })
    .catch(err => next(err));
}