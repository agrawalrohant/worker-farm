const { Observable } = require("rxjs");
const { createJobHandler } = require("./jobController");
const http = require("http");
const connection = require("../db");

function createBlobHandler(requestId, contentBase64, userInfo) {
  return new Observable(async (observer) => {
    const url = `http://${process.env.WORKER_BLOB_STORE_URL}/api/v1/blob`;
    console.log("Calling Worker Blob API... -> " + url);
    updateStatusQuery("IMAGE_UPLOAD_IN_PROGRESS", requestId);
    const request = http.request(
      url,
      {
        method: "POST",
        headers: {
          "Content-Type": "image/png",
          "Content-Length": "19213",
        },
      },
      (res) => {
        res.on("data", async (blobResponse) => {
          //console.log("blobResponse is " + blobResponse);
          updateStatusQuery("IMAGE_UPLOAD_SUCCESS", requestId);
          blobResponse = blobResponse.toString("utf8");
          blobResponse = JSON.parse(blobResponse);
          console.log("blob id is " + blobResponse.id);
          const [result, fields] = await connection.query(
            `insert into jobservice_blob (retryCount,blobId,lastUpdated,requestId) values (0, ${JSON.stringify(
              blobResponse.id
            )},NOW(),${requestId});`
          );
          if (result) {
            createJobHandler(userInfo, blobResponse.id, requestId).subscribe();
          }
        });
      }
    );

    request.on("error", (error) => {
      console.log("Error calling Blob API : " + error);
      updateStatusQuery("IMAGE_UPLOAD_FAILED", requestId);
    });

    request.write(JSON.stringify(contentBase64));
    request.end();
  });
}

async function updateStatusQuery(newStatus, requestId) {
  let sql = `update jobservice_request set requestStatus = ${JSON.stringify(
    newStatus
  )} where requestId = ${requestId};`;
  //console.log(sql);
  const [result, fields] = await connection.query(sql);
  return result;
}

module.exports = createBlobHandler;
