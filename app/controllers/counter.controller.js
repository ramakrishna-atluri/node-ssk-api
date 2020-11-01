const express = require('express');
const router = express.Router();
const counterService = require('../services/counter.service');

// routes
router.post('/updateCounter', updateCounter);
router.post('/createCounter', createCounter);
router.get('/', getAll);
router.get('/current', getCurrent);
router.get('/:id', getById);
router.put('/:id', update);
router.delete('/:id', _delete);

module.exports = router;

function updateCounter(req, res, next) {
    counterService.updateCounter(req.body)
    .then(() => res.json({}))
    .catch(err => next(err));
}

function createCounter(req, res, next) {
    counterService.createCounter(req.body)
        .then(() => res.json({}))
        .catch(err => next(err));
}

function getAll(req, res, next) {
    counterService.getAll()
        .then(users => res.json(users))
        .catch(err => next(err));
}

function getCurrent(req, res, next) {
    counterService.getById(req.user.sub)
        .then(user => user ? res.json(user) : res.sendStatus(404))
        .catch(err => next(err));
}

function getById(req, res, next) {
    counterService.getById(req.params.id)
        .then(user => user ? res.json(user) : res.sendStatus(404))
        .catch(err => next(err));
}

function update(req, res, next) {
    counterService.update(req.params.id, req.body)
        .then(() => res.json({}))
        .catch(err => next(err));
}

function _delete(req, res, next) {
    counterService.delete(req.params.id)
        .then(() => res.json({}))
        .catch(err => next(err));
}