const express = require('express');
const router = express.Router();
const connectionsService = require('../services/connections.service');

// routes
router.post('/connected', connected);
router.post('/requested', requested);
router.post('/received', received);
router.post('/rejected', rejected);

module.exports = router;

function connected(req, res, next) {
    connectionsService.connected(req.body)
        .then((response) => res.json(response))
        .catch(err => next(err));
}

function requested(req, res, next) {
    connectionsService.requested(req.body)
        .then((response) => res.json(response))
        .catch(err => next(err));
}

function received(req, res, next) {
    connectionsService.received(req.body)
        .then((response) => res.json(response))
        .catch(err => next(err));
}

function rejected(req, res, next) {
    connectionsService.rejected(req.body)
        .then((response) => res.json(response))
        .catch(err => next(err));
}