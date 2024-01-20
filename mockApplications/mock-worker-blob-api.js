const express = require("express");
const app = express();
const short = require("short-uuid");

app.listen(3001, () => {
  console.log(`Mock Worker blob API is running on port 3001`);
});

app.post("/api/v1/blob", function (req, res) {
  return res.json({
    status: 200,
    id: "blob-" + short.generate(),
  });
});

app.get("/api/v1/blob/:id", function (req, res) {
  return res.json({
    status: 200,
    blob: "dummyBlob",
  });
});
