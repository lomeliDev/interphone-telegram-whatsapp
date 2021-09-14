const container = require("./api/container");
const application = container.resolve("app");

application.start()
    .then(async () => {

    })
    .catch(err => {
        console.log(err);
        process.exit();
    });