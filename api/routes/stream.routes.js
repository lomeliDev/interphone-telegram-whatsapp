const { Router } = require("express");

module.exports = function ({ StreamController }) {
    const router = Router();

    router.get('/stream.mjpg', StreamController.stream.bind(StreamController));

    return router;
};