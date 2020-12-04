const express = require('express');
const router = express.Router();
const userPreferencesService = require('../services/userPreferences.service');

// routes
router.post('/createPreference', createPreference);
router.post('/updatePreference', updatePreference);
router.get('/', getAll);
router.get('/current', getCurrent);
router.get('/:id', getById);
router.put('/:id', update);
router.delete('/:id', _delete);

module.exports = router;

function createPreference(req, res, next) {
    userPreferencesService.createPreference(req.body)
        .then(() => res.json({}))
        .catch(err => next(err));
}

function updatePreference(req, res, next) {
    userPreferencesService.updatePreference(req.body)
        .then(() => res.json({}))
        .catch(err => next(err));
}

function getAll(req, res, next) {
    userPreferencesService.getAll()
        .then(users => res.json(users))
        .catch(err => next(err));
}

function getCurrent(req, res, next) {
    userPreferencesService.getById(req.user.sub)
        .then(user => user ? res.json(user) : res.sendStatus(404))
        .catch(err => next(err));
}

function getById(req, res, next) {
    userPreferencesService.getById(req.params.id)
        .then(user => user ? res.json(user) : res.sendStatus(404))
        .catch(err => next(err));
}

function update(req, res, next) {
    userPreferencesService.update(req.params.id, req.body)
        .then(() => res.json({}))
        .catch(err => next(err));
}

function _delete(req, res, next) {
    userPreferencesService.delete(req.params.id)
        .then(() => res.json({}))
        .catch(err => next(err));
}