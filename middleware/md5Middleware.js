const { Buffer } = require("buffer");
const crypto = require("crypto");

function md5Verification(req, res, next) {
  const imageJSONData = req.body;
  if (!imageJSONData.encoding) {
    return res.json({
      status: 400,
      message: "Bad Request : Image encoding type field 'encoding' is missing",
    });
  }
  // verify encoding is base64
  else if (imageJSONData.encoding !== "base64") {
    return res.json({
      status: 500,
      message: "encoding type not supported",
    });
  }

  if (!imageJSONData.content) {
    return res.json({
      status: 400,
      message: "Bad Request : Image information field 'content' is missing",
    });
  }
  const receivedBinaryData = Buffer.from(imageJSONData.content, "utf-8");
  const receivedMD5Checksum = crypto
    .createHash("md5")
    .update(receivedBinaryData)
    .digest("hex");

  if (!imageJSONData.MD5) {
    return res.json({
      status: 400,
      message: "Bad Request : MD5 checksum field 'MD5' is missing",
    });
  }
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
