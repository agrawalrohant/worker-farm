const short = require("short-uuid");
const connection = require("../db");
const createBlobHandler = require("./blobController");

/* Handler */
async function createJobHandler(req, res) {
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
    //console.log("Statement : " + sql);
    const [result, fields] = await connection.query(sql);
    //console.log(result);
    //console.log(fields);

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

function formatForDB(epochTimeStamp) {
  //console.log("epochTimeStamp :" + epochTimeStamp);
  //console.log("date :" + date.toISOString());
  return new Date(epochTimeStamp).toISOString().slice(0, 19).replace("T", " ");
}

module.exports = { createJobHandler };
