const express = require("express");
require("dotenv").config();
const PORT = process.env.PORT || 3000;
const app = express();
const { jwtVerification } = require("./middleware/jwtMIddleware");
const router = require("./routes");

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

app.use(express.json());
app.use(jwtVerification);

/* Router */
app.use("/", router);

// fallback response
app.use(function (req, res) {
  res.status(404).send("Resource Not Found");
});
