const container = require("./api/container");
const application = container.resolve("app");
const Whatsapp = container.resolve("WhatsappController");
const Telegram = container.resolve("TelegramController");
const Buttons = container.resolve("ButtonsController");
const Photo = container.resolve("PhotoController");
const Wss = container.resolve("WssController");
const Relays = container.resolve("RelaysController");
const Stream = container.resolve("StreamController");
const Video = container.resolve("VideoController");
const pjsua = container.resolve("pjsuaController");
const Proxy = container.resolve("ProxyController");

application.start()
    .then(async () => {
        await Whatsapp.start();
        await Telegram.start();
        await Buttons.start();
        await Photo.start();
        await Wss.start();
        await Relays.start();
        await Stream.start();
        await Video.start();
        await pjsua.start();
        await Proxy.start();
    })
    .catch(err => {
        console.log(err);
        process.exit();
    });