const { Observable } = require("rxjs");
const http = require("http");

function createJobHandler(userInfo, blobId) {
  return new Observable((observer) => {
    const url = `http://${process.env.WORKER_CLOUD_API_URL}/api/v1/job`;
    console.log("Calling Worker Job API... -> " + url);
    const request = http.request(
      url,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      },
      (res) => {
        res.on("data", (jobResponse) => {
          // TODO : store the job id in the DB and update the status
          jobResponse = jobResponse.toString("utf8");
          jobResponse = JSON.parse(jobResponse);
          console.log("job id is " + jobResponse.id);
          console.log("Job submitted successfully.");
        });
      }
    );

    request.on("error", (error) => {
      // TODO : Update the DB with blob error status
      console.log("Error calling Job API : " + error);
    });

    request.write(
      JSON.stringify({
        tenentId: userInfo.tenentId,
        clientId: userInfo.clientId,
        payloadLocation: `http://${process.env.WORKER_BLOB_STORE_URL}/api/v1/blob/${blobId}`,
        payloadSize: "19213",
      })
    );
    request.end();
  });
}

module.exports = createJobHandler;
