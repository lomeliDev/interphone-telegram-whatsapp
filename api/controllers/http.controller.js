'use strict'

class HttpController {

    constructor({ config, Log, ButtonsController, RelaysController, TelegramController, WhatsappController, pjsuaController }) {
        this._config = config;
        this._log = Log;
        this._buttons = ButtonsController;
        this._relays = RelaysController;
        this._tg = TelegramController;
        this._whats = WhatsappController;
        this._pjsua = pjsuaController;
    }

    statusLight(req, res) {
        try {
            res.status(200).send({ status: 200, message: 'OK', payload: { status: this._buttons.statusLight } });
        } catch (error) {
            res.status(422).send({ status: 422, message: error.message || 'An unexpected error occurred', payload: {} });
        }
    }

    onLight(req, res) {
        try {
            if (Date.now() > this._buttons.lastLight || this._buttons.lastLight == 0) {
                this._buttons.lastLight = Date.now() + (1000 * 3);
                this._tg.sendMessage("✅");
                this._whats.sendMessage("✅");
                this._relays.onLight();
                this._buttons.statusLight = true;
                res.status(200).send({ status: 200, message: 'OK', payload: {} });
            } else {
                throw new Error('Light: Wait a few seconds to perform the action')
            }
        } catch (error) {
            res.status(422).send({ status: 422, message: error.message || 'An unexpected error occurred', payload: {} });
        }
    }

    offLight(req, res) {
        try {
            if (Date.now() > this._buttons.lastLight || this._buttons.lastLight == 0) {
                this._buttons.lastLight = Date.now() + (1000 * 3);
                this._tg.sendMessage("❎");
                this._whats.sendMessage("❎");
                this._relays.offLight();
                this._buttons.statusLight = false;
                res.status(200).send({ status: 200, message: 'OK', payload: {} });
            } else {
                throw new Error('Light: Wait a few seconds to perform the action')
            }
        } catch (error) {
            res.status(422).send({ status: 422, message: error.message || 'An unexpected error occurred', payload: {} });
        }
    }

    statusAlarm(req, res) {
        try {
            res.status(200).send({ status: 200, message: 'OK', payload: { status: this._buttons.statusAlarm } });
        } catch (error) {
            res.status(422).send({ status: 422, message: error.message || 'An unexpected error occurred', payload: {} });
        }
    }

    onAlarm(req, res) {
        try {
            if (Date.now() > this._buttons.lastAlarm || this._buttons.lastAlarm == 0) {
                this._buttons.lastAlarm = Date.now() + (1000 * 3);
                this._tg.sendMessage("🔔");
                this._whats.sendMessage("🔔");
                this._relays.onAlarm();
                this._buttons.statusAlarm = true;
                res.status(200).send({ status: 200, message: 'OK', payload: {} });
            } else {
                throw new Error('Alarm: Wait a few seconds to perform the action')
            }
        } catch (error) {
            res.status(422).send({ status: 422, message: error.message || 'An unexpected error occurred', payload: {} });
        }
    }

    offAlarm(req, res) {
        try {
            if (Date.now() > this._buttons.lastAlarm || this._buttons.lastAlarm == 0) {
                this._buttons.lastAlarm = Date.now() + (1000 * 3);
                this._tg.sendMessage("🔕");
                this._whats.sendMessage("🔕");
                this._relays.offAlarm();
                this._buttons.statusAlarm = false;
                res.status(200).send({ status: 200, message: 'OK', payload: {} });
            } else {
                throw new Error('Alarm: Wait a few seconds to perform the action')
            }
        } catch (error) {
            res.status(422).send({ status: 422, message: error.message || 'An unexpected error occurred', payload: {} });
        }
    }

    openGarage(req, res) {
        try {
            if (Date.now() > this._buttons.lastGarage || this._buttons.lastGarage == 0) {
                this._buttons.lastGarage = Date.now() + (1000 * 5);
                this._tg.sendMessage("🚗");
                this._whats.sendMessage("🚗");
                this._relays.openGarage();
                res.status(200).send({ status: 200, message: 'OK', payload: {} });
            } else {
                throw new Error('Garage: Wait a few seconds to perform the action')
            }
        } catch (error) {
            res.status(422).send({ status: 422, message: error.message || 'An unexpected error occurred', payload: {} });
        }
    }

    openDoor(req, res) {
        try {
            if (Date.now() > this._buttons.lastDoor || this._buttons.lastDoor == 0) {
                this._buttons.lastDoor = Date.now() + (1000 * 5);
                this._tg.sendMessage("🚪");
                this._whats.sendMessage("🚪");
                this._relays.openDoor();
                res.status(200).send({ status: 200, message: 'OK', payload: {} });
            } else {
                throw new Error('Door: Wait a few seconds to perform the action')
            }
        } catch (error) {
            res.status(422).send({ status: 422, message: error.message || 'An unexpected error occurred', payload: {} });
        }
    }

    callAll(req, res) {
        try {
            this._pjsua.call(this._config.SIP_QUEUE);
            res.status(200).send({ status: 200, message: 'OK', payload: {} });
        } catch (error) {
            res.status(422).send({ status: 422, message: error.message || 'An unexpected error occurred', payload: {} });
        }
    }

}

module.exports = HttpController;