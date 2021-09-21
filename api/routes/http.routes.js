const { Router } = require("express");

module.exports = function ({ HttpController }) {
    const router = Router();

    router.get('/light/status', HttpController.statusLight.bind(HttpController));
    router.get('/light/on', HttpController.onLight.bind(HttpController));
    router.get('/light/off', HttpController.offLight.bind(HttpController));

    router.get('/alarm/status', HttpController.statusAlarm.bind(HttpController));
    router.get('/alarm/on', HttpController.onAlarm.bind(HttpController));
    router.get('/alarm/off', HttpController.offAlarm.bind(HttpController));

    router.get('/garage', HttpController.openGarage.bind(HttpController));
    router.get('/door', HttpController.openDoor.bind(HttpController));
    router.get('/call', HttpController.callAll.bind(HttpController));

    return router;
};