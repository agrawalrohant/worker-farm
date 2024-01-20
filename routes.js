const express = require("express");
const router = express.Router();
const { createJobHandler } = require("./controllers/requestController");
const {
  getMultipleJobStatusHandler,
  getJobStatusHandler,
} = require("./controllers/jobController");
const { md5Verification } = require("./middleware/md5Middleware");

router.post("/api/imageData", md5Verification, createJobHandler);
router.post("/api/jobs/multiple", getMultipleJobStatusHandler);
router.get("/api/job/:id", getJobStatusHandler);
module.exports = router;
