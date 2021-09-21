const { Router } = require("express");

module.exports = function ({ pjsuaController }) {
    const router = Router();

    router.get('/call', pjsuaController.callAll.bind(pjsuaController));
    router.get('/hangup', pjsuaController.HangUpApi.bind(pjsuaController));
    router.get('/close', pjsuaController.closepApi.bind(pjsuaController));

    return router;
};