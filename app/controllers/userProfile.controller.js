const express = require('express');
const router = express.Router();
const userProfileService = require('../services/userProfile.service');

// routes
router.post('/createProfile', createProfile);
router.post('/updateProfile', updateProfile);
router.get('/', getAll);
router.get('/current', getCurrent);
router.get('/:id', getById);
router.put('/:id', update);
router.delete('/:id', _delete);

module.exports = router;

function createProfile(req, res, next) {
    userProfileService.createProfile(req.body)
        .then(() => res.json({}))
        .catch(err => next(err));
}

function updateProfile(req, res, next) {
    userProfileService.updateProfile(req.body)
        .then(() => res.json({}))
        .catch(err => next(err));
}

function getAll(req, res, next) {
    userProfileService.getAll()
        .then(users => res.json(users))
        .catch(err => next(err));
}

function getCurrent(req, res, next) {
    userProfileService.getById(req.user.sub)
        .then(user => user ? res.json(user) : res.sendStatus(404))
        .catch(err => next(err));
}

function getById(req, res, next) {
    userProfileService.getById(req.params.id)
        .then(user => user ? res.json(user) : res.sendStatus(404))
        .catch(err => next(err));
}

function update(req, res, next) {
    userProfileService.update(req.params.id, req.body)
        .then(() => res.json({}))
        .catch(err => next(err));
}

function _delete(req, res, next) {
    userProfileService.delete(req.params.id)
        .then(() => res.json({}))
        .catch(err => next(err));
}