const urlServer = "http://" + window.location.host;
let pathStreamOn = urlServer + "/stream/stream.mjpg";
const pathStreamOff = "./images/camera.png";
let statusStream = false;
let statusLight = false;
let statusAlarm = false;
let dataSIP = {
    host: "",
    port: "",
    user: "",
    password: ""
}
let debug = false;
let webRTC = false;
let hostESP32 = "";

const log = (txt) => {
    debug && console.log(txt);
}

const focus = () => {
    $('html, body').animate({ scrollTop: $('#relog_1').offset().top }, 'slow');
}

const checkStrem = () => {
    if (statusStream) {
        document.getElementById("webcam").src = pathStreamOff;
        statusStream = false;
    } else {
        document.getElementById("webcam").src = pathStreamOn;
        statusStream = true;
    }
}

const checkStreamActive = () => {
    if (statusStream) {
        document.getElementById("webcam").src = pathStreamOff;
        statusStream = false;
    }
    setTimeout(() => {
        checkStreamActive();
    }, 180000);
}

const fetchAPI = (callback, path, status = true, details = () => { }) => {
    fetch(urlServer + path, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    })
        .then(async (resp) => {
            if (resp.status === 200) {
                return resp.json()
            } else {
                let msg = "an error occurred";
                try {
                    const body = (await resp.json());
                    msg = body.message;
                } catch (error) {
                    msg = "an error occurred";
                }
                throw new Error(msg)
            }
        })
        .then((data) => {
            status && toastr["success"](data.message);
            callback(data.payload);
        })
        .catch((error) => {
            toastr["error"](error.message, "Error");
            setTimeout(() => {
                details();
            }, 30000);
        });
}

const fetchESP32 = (host, path, status = true) => {
    fetch(host + path, {
        method: 'GET',
    })
        .then(async (resp) => {
            if (resp.status === 200) {
                return resp;
            } else {
                throw new Error("an error occurred");
            }
        })
        .then((data) => {
            status && toastr["success"](data.message);
        })
        .catch((error) => {
            toastr["error"](error.message, "Error");
        });
}

const getStatusLight = (data) => {
    statusLight = data.status;
    const container = document.getElementById("light");
    const container_2 = document.getElementById("light_2");
    if (statusLight) {
        container.classList.remove("btn-outline-light");
        container.classList.add("btn-light");
        container_2.classList.remove("btn-outline-light");
        container_2.classList.add("btn-light");
    } else {
        container.classList.remove("btn-light");
        container.classList.add("btn-outline-light");
        container_2.classList.remove("btn-light");
        container_2.classList.add("btn-outline-light");
    }
}

const getStatusAlarm = (data) => {
    statusAlarm = data.status;
    const container = document.getElementById("alarm");
    const container_2 = document.getElementById("alarm_2");
    if (statusAlarm) {
        container.classList.remove("btn-outline-secondary");
        container.classList.add("btn-secondary");
        container_2.classList.remove("btn-outline-secondary");
        container_2.classList.add("btn-secondary");
    } else {
        container.classList.remove("btn-secondary");
        container.classList.add("btn-outline-secondary");
        container_2.classList.remove("btn-outline-secondary");
        container_2.classList.add("btn-secondary");
    }
}

const checkLight = (data) => {
    fetchAPI(getStatusLight, "/api/http/light/status", false);
}

const toogleLight = () => {
    if (statusLight) {
        fetchAPI(checkLight, "/api/http/light/off");
        if (hostESP32 !== "") {
            fetchESP32("http://" + hostESP32, "/off", false);
        }
    } else {
        fetchAPI(checkLight, "/api/http/light/on");
        if (hostESP32 !== "") {
            fetchESP32("http://" + hostESP32, "/on", false);
        }
    }
    focus();
}

const checkAlarm = (data) => {
    fetchAPI(getStatusAlarm, "/api/http/alarm/status", false);
}

const toogleAlarm = () => {
    if (statusAlarm) {
        fetchAPI(checkAlarm, "/api/http/alarm/off");
    } else {
        fetchAPI(checkAlarm, "/api/http/alarm/on");
    }
    focus();
}

const Door = () => {
    fetchAPI((data) => { }, "/api/http/door");
    focus();
}

const Garage = () => {
    fetchAPI((data) => { }, "/api/http/garage");
    focus();
}

const Call = () => {
    fetchAPI((data) => { }, "/api/http/call");
    focus();
}

const Reload = () => {
    if (confirm("Are you sure to reboot the pjsua?")) {
        fetchAPI((data) => { }, "/api/pjsua/reload");
        focus();
    }
}

const Hangup = () => {
    fetchAPI((data) => { }, "/api/http/hangup");
    try {
        webphone_api.hangup();
    } catch (error) { }
    try {
        webphone_api.reject();
    } catch (error) { }
    focus();
}

const Accept = () => {
    try {
        webphone_api.accept();
    } catch (error) { }
    focus();
}

const Details = () => {
    fetchAPI((data) => {
        $("#memory_free").html(data.memory.free);
        $("#memory_used").html(data.memory.used);
        $("#memory_total").html(data.memory.total);
        $("#network_rx").html(data.network.rx);
        $("#network_tx").html(data.network.tx);
        $("#network_total").html(data.network.total);
        $("#cpu").html(data.cpu);
        $("#disk").html(data.disk);
        $("#pjsua").html(data.pjsua);
        getStatusLight({ status: data.light });
        getStatusAlarm({ status: data.alarm });
        if (!statusStream && data.light) {
            statusStream = true;
            setTimeout(() => {
                document.getElementById("webcam").src = pathStreamOn;
            }, 12000);
        }
        setTimeout(() => {
            Details();
        }, 3000);
    }, "/api/http/details", false, Details);
}

const getDate = () => {
    var d = new Date();
    var n = d.toLocaleTimeString();
    $("#relog_1").html(n);
    $("#relog_2").html(n);
    setTimeout(() => {
        getDate();
    }, 1000);
}

const getSip = () => {
    fetchAPI((data) => {
        dataSIP = {
            host: data.host,
            port: data.port,
            user: data.user,
            password: data.password
        }
        setTimeout(() => {
            connectSIP();
        }, 3000);
    }, "/api/http/sip", false);
}

const connectSIP = () => {
    webphone_api.setparameter('serveraddress', dataSIP.host + dataSIP.port);
    webphone_api.setparameter('username', dataSIP.user);
    webphone_api.setparameter('password', dataSIP.password);
    $("#log").html("Initializing SIP...");
    webphone_api.start();
}

const eventsSIP = () => {
    webphone_api.onAppStateChange(function (appState) {
        if (appState === 'loaded') {
            $("#log").html("EVENT SIP, Loaded");
        }
        else if (appState === 'started') {
            $("#log").html("EVENT SIP, Started");
            $("#connectSIP").hide();
            $("#Call").show();
            $("#Hangup").show();
        }
        else if (appState === 'stopped') {
            $("#log").html("EVENT SIP, Stopped");
            $("#connectSIP").show();
            $("#Call").hide();
            $("#Hangup").hide();
            $("#Accept").hide();
            $("#Refresh").show();
        }
    });

    webphone_api.onRegStateChange(function (regState) {
        if (regState === 'registered') {
            $("#log").html("EVENT SIP, Registered");
            $("#connectSIP").hide();
            $("#Call").show();
            $("#Hangup").show();
        }
        else if (regState === 'unregistered') {
            $("#log").html("EVENT SIP, UnRegistered");
            $("#connectSIP").show();
            $("#Call").hide();
            $("#Hangup").hide();
            $("#Accept").hide();
            $("#Refresh").show();
        }
        else if (regState === 'failed') {
            $("#log").html("EVENT SIP, failed");
            $("#connectSIP").show();
            $("#Call").hide();
            $("#Hangup").hide();
            $("#Accept").hide();
            $("#Refresh").show();
        }
    });

    webphone_api.onCallStateChange(function (event, direction, peername, peerdisplayname, line, callid) {
        $("#log").html("EVENT SIP, Call " + event);

        if (event === 'setup') {
            if (direction == 2) {
                $("#Accept").show();
                $("#Call").hide();
            }
            $("#log").html("EVENT SIP, Call setup");
        } else if (event === 'connected') {
            if (direction == 2) {
                $("#Accept").hide();
                $("#Call").hide();
            }
        } else if (event === 'disconnected') {
            $("#log").html("EVENT SIP, Call disconnected");
            $("#connectSIP").hide();
            $("#Accept").hide();
            $("#Call").show();
        }
    });
}

const Refresh = () => {
    window.location.reload();
    focus();
}

const ESP32 = () => {
    if (confirm("Are you sure to reboot the esp32?")) {
        fetchESP32("http://" + hostESP32, "/reboot", false);
        setTimeout(() => {
            Refresh();
        }, 5000);
    }
}

const Reboot = () => {
    if (confirm("Are you sure to reboot the raspberry pi?")) {
        fetchAPI((data) => {
            toastr["success"]("Rebooting device");
        }, "/api/http/reboot");
    }
}

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById("webcam").src = pathStreamOff;

    fetchAPI((data) => {

        fetchAPI(checkLight, "/api/http/light/off-init", false);
        fetchAPI(checkLight, "/api/http/alarm/off-init", false);

        if (data.camera === 'ESP32') {
            pathStreamOn = "http://" + data.hostCamera + "/mjpeg/1";
            hostESP32 = data.hostCamera;
            fetchESP32("http://" + hostESP32, "/off", false);
            $("#ESP32").show();
        } else if (data.camera === 'NATIVE') {
            pathStreamOn = urlServer + "/stream/stream.mjpg";
            $("#ESP32").hide();
        }
        if (data.debug === true) {
            debug = true;
        }

        if (data.webRTC === true) {
            webRTC = true;
        }

        toastr.options = {
            "closeButton": true,
            "debug": false,
            "newestOnTop": false,
            "progressBar": false,
            "positionClass": "toast-bottom-right",
            "preventDuplicates": true,
            "onclick": null,
            "showDuration": "300",
            "hideDuration": "1000",
            "timeOut": "5000",
            "extendedTimeOut": "1000",
            "showEasing": "swing",
            "hideEasing": "linear",
            "showMethod": "fadeIn",
            "hideMethod": "fadeOut"
        }
        fetchAPI(getStatusLight, "/api/http/light/status", false);
        fetchAPI(getStatusAlarm, "/api/http/alarm/status", false);
        Details();
        getDate();
        checkStreamActive();
        if (webRTC) {
            const script = document.createElement('script');
            script.src = "./webphone_api.js?jscodeversion=290";
            document.getElementsByTagName('head')[0].appendChild(script);
            script.onload = function () {
                $("#log").show();
                log("Script loaded and ready");
                getSip();
                webphone_api.parameters['autostart'] = 0;
                eventsSIP();
                $("#connectSIP").hide();
                $("#Call").hide();
                $("#Hangup").hide();
                $("#Accept").hide();
                $("#Refresh").show();
            };
        } else {
            $("#connectSIP").hide();
            $("#Accept").hide();
            $("#log").hide();
        }

    }, "/api/http/general", false);

});