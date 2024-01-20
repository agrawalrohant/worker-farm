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
    Object.keys(MandatoryInputFields).forEach((key) => {
      if (!decoded[key]) {
        return res.json({
          status: 400,
          message: "Bad Request : " + MandatoryInputFields[key],
        });
      }
    });
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

const MandatoryInputFields = {
  sub: "User ID i.e. field 'sub' is missing",
  name: "UserName i.e. 'name' is missing",
  iat: "Issue At Time i.e. 'iat' is missing",
  tid: "tenentId i.e. 'tid' is missing",
  oid: "clientId i.e. 'oid' is missing",
  aud: "audience i.e. 'aud' is missing",
  azp: "appid i.e. 'azp' is missing",
  email: "email id i.e. 'email' is missing",
};

module.exports = { jwtVerification };
