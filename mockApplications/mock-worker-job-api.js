const express = require("express");
const app = express();
const short = require("short-uuid");

app.listen(3002, () => {
  console.log(`Mock Worker job API is running on port 3002`);
});

app.post("/api/v1/job", function (req, res) {
  return res.json({
    status: 200,
    id: "job-" + short.generate(),
  });
});

app.get("/api/v1/job/:id/status", function (req, res) {
  console.log(`Received get request for ${req.params.id}.`);
  let result = "";
  let randomNumner = Math.floor(Math.random() * 3);
  if (randomNumner == 1) {
    result = "RUNNING";
  } else if (randomNumner == 2) {
    result = "SUCCESS";
  } else {
    result = "FAILED";
  }
  console.log(`Sending response ${result}.`);
  return res.json({
    status: 200,
    result: result,
  });
});
