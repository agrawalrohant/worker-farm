const { Observable } = require("rxjs");
const { createJobHandler } = require("./jobController");
const http = require("http");
const connection = require("../db");
const FormData = require("form-data");
const { Buffer } = require("buffer");
const mime = require("mime-types");

function createBlobHandler(requestId, contentBase64, userInfo) {
  return new Observable(async (observer) => {
    const url = `http://${process.env.WORKER_BLOB_STORE_URL}/api/v1/blob`;
    //console.log("Calling Worker Blob API... -> " + url);
    updateStatusQuery("IMAGE_UPLOAD_IN_PROGRESS", requestId);
    let metaInfo = getSizeAndMimeTypeInfo(contentBase64);
    const request = http.request(
      url,
      {
        method: "POST",
        headers: {
          "Content-Type": metaInfo.mimeType,
          "Content-Length": metaInfo.byteChar.length,
        },
      },
      (res) => {
        res.on("data", async (blobResponse) => {
          //console.log("blobResponse is " + blobResponse);
          updateStatusQuery("IMAGE_UPLOAD_SUCCESS", requestId);
          blobResponse = blobResponse.toString("utf8");
          blobResponse = JSON.parse(blobResponse);
          //console.log("blob id is " + blobResponse.id);
          const [result, fields] = await connection.query(
            `insert into jobservice_blob (retryCount,blobId,lastUpdated,requestId) values (0, ${JSON.stringify(
              blobResponse.id
            )},NOW(),${requestId});`
          );
          if (result) {
            createJobHandler(
              userInfo,
              blobResponse.id,
              requestId,
              metaInfo.byteChar.length
            ).subscribe(
              (data) => {},
              (error) => {
                console.log("Error while making the Job API call " + error);
              }
            );
          }
        });
      }
    );

    request.on("error", (error) => {
      console.log("Error calling Blob API : " + error);
      updateStatusQuery("IMAGE_UPLOAD_FAILED", requestId);
    });

    const formData = new FormData();
    formData.append(
      "file",
      Buffer.from(contentBase64.split(",")[1], "base64"),
      {
        contentType: metaInfo.contentType,
      }
    );
    formData.pipe(request);
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

function getSizeAndMimeTypeInfo(contentBase64) {
  return {
    contentType: contentBase64.split(";")[0].split(":")[1],
    mimeType: mime.lookup(
      contentBase64.split(";")[0].split(":")[1].split("/")[1]
    ),
    byteChar: atob(contentBase64.split(",")[1]),
  };
}

module.exports = createBlobHandler;
