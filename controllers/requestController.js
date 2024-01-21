/** Incoming Reqest Handler */

const short = require("short-uuid");
const connection = require("../db");
const createBlobHandler = require("./blobController");

/** API to create new Job from request */
async function createRequestHandler(req, res) {
  const id = short.generate();
  const userInfo = req.userInfo;
  const sql = `insert into jobservice_request ( requestId, requestStatus,createdDate,userId,userName,email,appid,clientId,tenentId, audience, issueAtDate, imageBase64) 
  values (${JSON.stringify(id)}, "REQUEST_RECEIVED", NOW(),${parseInt(
    userInfo.userID
  )},${JSON.stringify(userInfo.UserName)},${JSON.stringify(userInfo.email)},${
    userInfo.appid
  },${userInfo.clientId},${userInfo.tenentId},${JSON.stringify(
    userInfo.audience
  )}, ${JSON.stringify(formatForDB(userInfo.IssueAtTime))}, ${JSON.stringify(
    req.body.content
  )});`;
  try {
    const [result, fields] = await connection.query(sql);

    if (result) {
      createBlobHandler(
        JSON.stringify(id),
        req.body.content,
        req.userInfo
      ).subscribe(
        (data) => {},
        (error) => {
          console.log("Error while making blob API call" + error);
        }
      );
    }

    return res.json({
      status: 200,
      requestId: id,
    });
  } catch (err) {
    console.log(err);
  }
}

/** Internal function - used for date time conversion fron epoch to 'YYYY-MM-DD HH:MM:SS' */
function formatForDB(epochTimeStamp) {
  return new Date(epochTimeStamp).toISOString().slice(0, 19).replace("T", " ");
}

module.exports = createRequestHandler;
