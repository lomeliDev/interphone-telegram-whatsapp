const { Router } = require("express");

module.exports = function ({ WhatsappController, config }) {
    const router = Router();

    router.get('/qr', WhatsappController.generateQR.bind(WhatsappController));
    router.get('/status', WhatsappController.status.bind(WhatsappController));
    router.get('/' + config.PATH_LOGOUT, WhatsappController.logout.bind(WhatsappController));

    return router;
};