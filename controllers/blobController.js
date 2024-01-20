const { Observable } = require("rxjs");
const createJobHandler = require("./jobController");
const http = require("http");

function createBlobHandler(contentBase64, userInfo) {
  return new Observable((observer) => {
    const url = `http://${process.env.WORKER_BLOB_STORE_URL}/api/v1/blob`;
    console.log("Calling Worker Blob API... -> " + url);
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
        res.on("data", (blobResponse) => {
          // TODO : store the blob id in the DB and update the status
          createJobHandler(userInfo, blobResponse.id).subscribe();
        });
      }
    );

    request.on("error", (error) => {
      // TODO : Update the DB with blob error status
      console.log("Error calling Blob API : " + error);
    });

    request.write(contentBase64);
    request.end();
  });
}

module.exports = createBlobHandler;
