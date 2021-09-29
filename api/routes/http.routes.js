const { Router } = require("express");

module.exports = function ({ HttpController, ProxyController }) {
    const router = Router();

    router.get('/light/status', HttpController.statusLight.bind(HttpController));
    router.get('/light/on', HttpController.onLight.bind(HttpController));
    router.get('/light/off', HttpController.offLight.bind(HttpController));
    router.get('/light/status/yes', HttpController.yesStatusLight.bind(HttpController));
    router.get('/light/status/no', HttpController.noStatusLight.bind(HttpController));

    router.get('/alarm/status', HttpController.statusAlarm.bind(HttpController));
    router.get('/alarm/on', HttpController.onAlarm.bind(HttpController));
    router.get('/alarm/off', HttpController.offAlarm.bind(HttpController));
    router.get('/alarm/status/yes', HttpController.yesStatusAlarm.bind(HttpController));
    router.get('/alarm/status/no', HttpController.noStatusAlarm.bind(HttpController));

    router.get('/garage', HttpController.openGarage.bind(HttpController));
    router.get('/door', HttpController.openDoor.bind(HttpController));
    router.get('/call', HttpController.callAll.bind(HttpController));
    router.get('/hangup', HttpController.Hangup.bind(HttpController));
    router.get('/details', HttpController.Details.bind(HttpController));
    router.get('/sip', HttpController.SIP.bind(HttpController));
    router.get('/general', HttpController.General.bind(HttpController));
    router.get('/reboot', HttpController.Reboot.bind(HttpController));
    router.get('/redirect', ProxyController.Redirect.bind(ProxyController));

    return router;
};