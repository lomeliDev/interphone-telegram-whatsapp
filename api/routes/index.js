const express = require("express");
const { Router } = require("express");
const cors = require("cors");
const compression = require("compression");

module.exports = function ({ WhatsappRoutes, StreamRoutes, pjsuaRoutes, HttpRoutes }) {
    const router = Router();
    const apiRoute = Router();
    const stream = Router();

    apiRoute.use(cors())
    apiRoute.use(compression())
    apiRoute.use(express.json({ limit: '50mb' }))
    apiRoute.use(express.urlencoded({ extended: false, limit: '50mb' }))

    apiRoute.use(function (req, res, next) {
        res.setHeader('X-Powered-By', 'Interfon');
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin , X-Requested-With , Content-Type , Accept , Access-Control-Allow-Request-Method');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT , DELETE');
        res.setHeader('Allow', 'GET, POST, OPTIONS, PUT , DELETE');
        next();
    });

    stream.use(function (req, res, next) {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, pre-check=0, post-check=0, max-age=0');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Connection', 'close');
        res.setHeader('Content-Type', 'multipart/x-mixed-replace; boundary=--myboundary');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin , X-Requested-With , Content-Type , Accept , Access-Control-Allow-Request-Method');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT , DELETE');
        res.setHeader('Allow', 'GET, POST, OPTIONS, PUT , DELETE');
        next();
    });

    apiRoute.use("/whatsapp", WhatsappRoutes);
    apiRoute.use("/pjsua", pjsuaRoutes);
    apiRoute.use("/http", HttpRoutes);
    stream.use("/", StreamRoutes);
    router.use("/api", apiRoute);
    router.use("/stream", stream);
    router.use('/', express.static(__dirname + '/../../public/'));

    return router;
};