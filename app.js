const express = require("express");
require("dotenv").config();

const PORT = process.env.PORT || 3000;
const app = express();

const { createJobHandler } = require("./controllers/jobController");
const { jwtVerification } = require("./middleware/jwtMIddleware");
const { md5Verification } = require("./middleware/md5Middleware");

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

app.use(express.json());
app.use(jwtVerification);

/* Routes */
app.post("/api/imageData", md5Verification, createJobHandler);