const express = require("express");
require("dotenv").config();

const PORT = process.env.PORT || 3000;
const app = express();

const { createJobHandler } = require("./controllers/jobController");
const { jwtVerification } = require("./middleware/jwtMIddleware");

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

app.use(express.json());
app.use(jwtVerification);

/* Routes */
app.post("/api/imageData", createJobHandler);
