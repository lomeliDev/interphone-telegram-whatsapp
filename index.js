const container = require("./api/container");
const application = container.resolve("app");
const Whatsapp = container.resolve("WhatsappController");

application.start()
    .then(async () => {
        await Whatsapp.start();
    })
    .catch(err => {
        console.log(err);
        process.exit();
    });