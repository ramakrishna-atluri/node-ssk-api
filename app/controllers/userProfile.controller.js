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
router.post('/getTopMatches', getTopMatches);
router.post('/getTopSavedMatches', getTopSavedMatches);
router.post('/getAllMatches', getAllMatches);
router.post('/getAllSavedMatches', getAllSavedMatches);

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

function getAllMatches(req, res, next) {
    userProfileService.getAllMatches(req.body)
        .then((matchList) => res.json(matchList))
        .catch(err => next(err));
}

function getAllSavedMatches(req, res, next) {
    userProfileService.getAllSavedMatches(req.body)
        .then((matchList) => res.json(matchList))
        .catch(err => next(err));
}

function getTopMatches(req, res, next) {
    userProfileService.getTopMatches(req.body)
        .then((matchList) => res.json(matchList))
        .catch(err => next(err));
}

function getTopSavedMatches(req, res, next) {
    userProfileService.getTopSavedMatches(req.body)
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