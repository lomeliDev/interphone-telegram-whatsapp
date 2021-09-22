const urlServer = "http://192.168.0.10:5001";
const pathStreamOn = urlServer + "/stream/stream.mjpg";
const pathStreamOff = "./images/camera.png";
const debug = true;
const webRTC = false;
let statusStream = false;
let statusLight = false;
let statusAlarm = false;
let dataSIP = {
    host: "",
    port: "",
    user: "",
    password: ""
}

const log = (txt) => {
    debug && console.log(txt);
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
    if (statusAlarm) {
        container.classList.remove("btn-outline-secondary");
        container.classList.add("btn-secondary");
    } else {
        container.classList.remove("btn-secondary");
        container.classList.add("btn-outline-secondary");
    }
}

const checkLight = (data) => {
    fetchAPI(getStatusLight, "/api/http/light/status", false);
}

const toogleLight = () => {
    if (statusLight) {
        fetchAPI(checkLight, "/api/http/light/off");
    } else {
        fetchAPI(checkLight, "/api/http/light/on");
    }
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
}

const Door = () => {
    fetchAPI((data) => { }, "/api/http/door");
}

const Garage = () => {
    fetchAPI((data) => { }, "/api/http/garage");
}

const Call = () => {
    fetchAPI((data) => { }, "/api/http/call");
}

const Hangup = () => {
    fetchAPI((data) => { }, "/api/http/hangup");
    try {
        webphone_api.hangup();
    } catch (error) { }
    try {
        webphone_api.reject();
    } catch (error) { }
}

const Accept = () => {
    try {
        webphone_api.accept();
    } catch (error) { }
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
}

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById("webcam").src = pathStreamOff;
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
    if (webRTC) {
        getSip();
        webphone_api.parameters['autostart'] = 0;
        eventsSIP();
        $("#connectSIP").hide();
        $("#Call").hide();
        $("#Hangup").hide();
        $("#Accept").hide();
        $("#Refresh").show();
    } else {
        $("#connectSIP").hide();
        $("#Accept").hide();
        setTimeout(() => {
            try { webphone_api.stop(); } catch (error) { log(error); }
            try { webphone_api.unregister(); } catch (error) { log(error); }
        }, 6000);
    }
});