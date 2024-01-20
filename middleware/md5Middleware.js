const { Buffer } = require("buffer");
const crypto = require("crypto");

function md5Verification(req, res, next) {
  const imageJSONData = req.body;
  const receivedBinaryData = Buffer.from(imageJSONData.content, "utf-8");
  const receivedMD5Checksum = crypto
    .createHash("md5")
    .update(receivedBinaryData)
    .digest("hex");
  if (receivedMD5Checksum === imageJSONData.MD5) {
    next();
  } else {
    return res.json({
      status: 400,
      message: "Bad Request : checksum verification failed",
    });
  }
}

module.exports = { md5Verification };
