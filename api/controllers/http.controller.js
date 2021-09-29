'use strict'

const shellExec = require('shell-exec');

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

    Hangup(req, res) {
        try {
            this._pjsua.HangUp();
            res.status(200).send({ status: 200, message: 'OK', payload: {} });
        } catch (error) {
            res.status(422).send({ status: 422, message: error.message || 'An unexpected error occurred', payload: {} });
        }
    }

    async Details(req, res) {
        try {
            const memory_free = await shellExec("free -mh | awk 'FNR == 2 {print $4}'");
            const memory_used = await shellExec("free -mh | awk 'FNR == 2 {print $3}'");
            const memory_total = await shellExec("free -mh | awk 'FNR == 2 {print $2}'");
            const disk = await shellExec("df -h | awk 'FNR == 2 {print $4}'");
            const cpu = await shellExec("mpstat | awk 'FNR == 4 {print $3}'");
            const network_rx_value = await shellExec("vnstat -i " + this._config.INTERFACE_NETWORK + " | awk 'FNR == 5 {print $2}'");
            const network_rx_title = await shellExec("vnstat -i " + this._config.INTERFACE_NETWORK + " | awk 'FNR == 5 {print $3}'");
            const network_tx_value = await shellExec("vnstat -i " + this._config.INTERFACE_NETWORK + " | awk 'FNR == 5 {print $5}'");
            const network_tx_title = await shellExec("vnstat -i " + this._config.INTERFACE_NETWORK + " | awk 'FNR == 5 {print $6}'");
            const network_total_value = await shellExec("vnstat -i " + this._config.INTERFACE_NETWORK + " | awk 'FNR == 5 {print $8}'");
            const network_total_title = await shellExec("vnstat -i " + this._config.INTERFACE_NETWORK + " | awk 'FNR == 5 {print $9}'");
            const pjsua = await shellExec("pgrep pjsua");
            res.status(200).send({
                status: 200, message: 'OK', payload: {
                    memory: {
                        free: memory_free.stdout.replace("\n", ""),
                        used: memory_used.stdout.replace("\n", ""),
                        total: memory_total.stdout.replace("\n", ""),
                    },
                    network: {
                        rx: network_rx_value.stdout.replace("\n", "") + network_rx_title.stdout.replace("\n", ""),
                        tx: network_tx_value.stdout.replace("\n", "") + network_tx_title.stdout.replace("\n", ""),
                        total: network_total_value.stdout.replace("\n", "") + network_total_title.stdout.replace("\n", ""),
                    },
                    disk: disk.stdout.replace("\n", ""),
                    cpu: cpu.stdout.replace("\n", "%"),
                    pjsua: pjsua.stdout.replace("\n", ""),
                }
            });
        } catch (error) {
            res.status(422).send({ status: 422, message: error.message || 'An unexpected error occurred', payload: {} });
        }
    }

    yesStatusLight(req, res) {
        this._buttons.statusLight = true;
        res.status(200).send({ status: 200, message: 'OK', payload: {} });
    }

    noStatusLight(req, res) {
        this._buttons.statusLight = false;
        res.status(200).send({ status: 200, message: 'OK', payload: {} });
    }

    yesStatusAlarm(req, res) {
        this._buttons.statusAlarm = true;
        res.status(200).send({ status: 200, message: 'OK', payload: {} });
    }

    noStatusAlarm(req, res) {
        this._buttons.statusAlarm = false;
        res.status(200).send({ status: 200, message: 'OK', payload: {} });
    }

    SIP(req, res) {
        try {
            res.status(200).send({
                status: 200, message: 'OK', payload: {
                    host: this._config.SIP_HOST,
                    port: this._config.SIP_PORT,
                    user: this._config.SIP_USER,
                    password: this._config.SIP_PASS
                }
            });
        } catch (error) {
            res.status(422).send({ status: 422, message: error.message || 'An unexpected error occurred', payload: {} });
        }
    }

    General(req, res) {
        try {
            res.status(200).send({
                status: 200, message: 'OK', payload: {
                    debug: this._config.DEBUG === '1' ? true : false,
                    camera: this._config.CAMERA,
                    webRTC: this._config.SIP_WEBRTC === 'true' ? true : false,
                    hostCamera: this._config.HOST_CAMERA
                }
            });
        } catch (error) {
            res.status(422).send({ status: 422, message: error.message || 'An unexpected error occurred', payload: {} });
        }
    }

    async Reboot(req, res) {
        try {
            shellExec("sudo reboot");
            res.status(200).send({ status: 200, message: 'OK', payload: {} });
        } catch (error) {
            res.status(422).send({ status: 422, message: error.message || 'An unexpected error occurred', payload: {} });
        }
    }

}

module.exports = HttpController;