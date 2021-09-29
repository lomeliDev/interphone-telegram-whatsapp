const { asClass, createContainer, asFunction, asValue } = require("awilix");

const container = createContainer();

// app start
const StartUp = require("./startup");
const Server = require("./server");
const config = require("../config/environments");

// utils
const Log = require("./utils/Log");

// routes
const Routes = require("../api/routes");
const WhatsappRoutes = require("../api/routes/whatsapp.routes");
const StreamRoutes = require("../api/routes/stream.routes");
const pjsuaRoutes = require("../api/routes/pjsua.routes");
const HttpRoutes = require("../api/routes/http.routes");

// controllers
const {
    WhatsappController,
    TelegramController,
    ButtonsController,
    PhotoController,
    VideoController,
    WssController,
    RelaysController,
    StreamController,
    pjsuaController,
    HttpController,
    GatewayController,
    ProxyController,
} = require("../api/controllers");

container
    .register({
        app: asClass(StartUp).singleton(),
        router: asFunction(Routes).singleton(),
        server: asClass(Server).singleton(),
        config: asValue(config),
        Log: asClass(Log).singleton(),
    })
    .register({
        WhatsappController: asClass(WhatsappController).singleton(),
        WhatsappRoutes: asFunction(WhatsappRoutes).singleton(),
    })
    .register({
        TelegramController: asClass(TelegramController).singleton(),
    })
    .register({
        ButtonsController: asClass(ButtonsController).singleton(),
    })
    .register({
        PhotoController: asClass(PhotoController).singleton(),
        VideoController: asClass(VideoController).singleton(),
        WssController: asClass(WssController).singleton(),
        RelaysController: asClass(RelaysController).singleton(),
    })
    .register({
        StreamController: asClass(StreamController).singleton(),
        StreamRoutes: asFunction(StreamRoutes).singleton(),
    })
    .register({
        pjsuaController: asClass(pjsuaController).singleton(),
        pjsuaRoutes: asFunction(pjsuaRoutes).singleton(),
    })
    .register({
        GatewayController: asClass(GatewayController).singleton(),
        HttpController: asClass(HttpController).singleton(),
        HttpRoutes: asFunction(HttpRoutes).singleton(),
    })
    .register({
        ProxyController: asClass(ProxyController).singleton(),
    })

module.exports = container;
