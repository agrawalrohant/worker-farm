const express = require("express");
const router = express.Router();
const { createJobHandler } = require("./controllers/requestController");
const { md5Verification } = require("./middleware/md5Middleware");

router.post("/api/imageData", md5Verification, createJobHandler);

module.exports = router;
