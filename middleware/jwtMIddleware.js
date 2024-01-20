const jwt = require("jsonwebtoken");
require("dotenv").config();
const secretKey = process.env.SECRET_KEY || "";

function jwtVerification(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.json({
      status: 401,
      message: "No token provided",
    });
  }
  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.json({
      status: 401,
      message: "Token syntex invalid",
    });
  }
  try {
    const decoded = jwt.verify(token, secretKey);
    req.userInfo = {
      userID: decoded.sub,
      UserName: decoded.name,
      IssueAtTime: new Date(decoded.iat),
      tenentId: decoded.tid,
      clientId: decoded.oid,
      audience: decoded.aud,
      appid: decoded.azp,
      email: decoded.email,
    };
    next();
  } catch (error) {
    return res.json({
      status: 401,
      message: "Token invalid",
    });
  }
}

module.exports = { jwtVerification };
