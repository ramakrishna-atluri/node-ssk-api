const express = require('express');
const router = express.Router();
const notificationsService = require('../services/notifications.service');

// routes
router.post('/create', create);
router.post('/update', update);
router.post('/delete', deleteNotification);
router.post('/deleteAll', deleteAll);
router.post('/retrieve', retrieve);

module.exports = router;

function create(req, res, next) {
    notificationsService.createNotification(req.body)
        .then((response) => res.json(response))
        .catch(err => next(err));
}

function update(req, res, next) {
    notificationsService.updateNotification(req.body)
        .then((response) => res.json(response))
        .catch(err => next(err));
}

function deleteNotification(req, res, next) {
    notificationsService.deleteNotification(req.body)
        .then((response) => res.json(response))
        .catch(err => next(err));
}

function deleteAll(req, res, next) {
    notificationsService.deleteAllNotifications(req.body)
        .then((response) => res.json(response))
        .catch(err => next(err));
}

function retrieve(req, res, next) {
    notificationsService.getNotifications(req.body)
        .then(notifications => res.json(notifications))
        .catch(err => next(err));
}