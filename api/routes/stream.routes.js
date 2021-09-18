const { Router } = require("express");

module.exports = function ({ StreamController, config }) {
    const router = Router();

    router.get('/', StreamController.stream.bind(StreamController));
    // router.get('/status', WhatsappController.status.bind(WhatsappController));
    // router.get('/' + config.PATH_LOGOUT, WhatsappController.logout.bind(WhatsappController));

    return router;
};