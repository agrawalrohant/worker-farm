const { Observable } = require("rxjs");
const http = require("http");
const connection = require("../db");

function createJobHandler(userInfo, blobId, requestId) {
  return new Observable((observer) => {
    const url = `http://${process.env.WORKER_CLOUD_API_URL}/api/v1/job`;
    console.log("Calling Worker Job API... -> " + url);
    updateStatusQuery("JOB_SUBMIT_IN_PROGRESS", requestId);
    const request = http.request(
      url,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      },
      (res) => {
        res.on("data", async (jobResponse) => {
          updateStatusQuery("JOB_SUBMIT_SUCCESS", requestId);
          jobResponse = jobResponse.toString("utf8");
          jobResponse = JSON.parse(jobResponse);
          console.log("job id is " + jobResponse.id);
          const [result, fields] = await connection.query(
            `insert into jobservice_job (retryCount,jobId,lastUpdated,requestId) values (0, ${JSON.stringify(
              jobResponse.id
            )},NOW(),${requestId});`
          );
          if (result) {
            console.log(" ** Job submitted successfully. ** ");
          }
        });
      }
    );

    request.on("error", (error) => {
      console.log("Error calling Job API : " + error);
      updateStatusQuery("JOB_SUBMIT_FAILED", requestId);
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

function getMultipleJobStatusHandler(req, res) {
  return res.json({
    status: 200,
    message: "dummy",
  });
}

function getJobStatusHandler(req, res) {
  return res.json({
    status: 200,
    message: "dummy",
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

module.exports = {
  createJobHandler,
  getMultipleJobStatusHandler,
  getJobStatusHandler,
};
