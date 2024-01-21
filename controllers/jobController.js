/** Job operation Handler */

const { Observable } = require("rxjs");
const http = require("http");
const connection = require("../db");
const { response } = require("express");

/** API to handle Job Submission */
function createJobHandler(userInfo, blobId, requestId, payloadSize) {
  return new Observable((observer) => {
    const url = `http://${process.env.WORKER_CLOUD_API_URL}/api/v1/job`;
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
        payloadSize: payloadSize,
      })
    );
    request.end();
  });
}

/** API to get multiple Job status in a single go */
async function getMultipleJobStatusHandler(req, res) {
  const idInfo = req.body;
  if (!idInfo || !idInfo.ids || !Array.isArray(idInfo.ids)) {
    return res.json({
      status: 400,
      message: "Bad Request : json format incorrect.",
    });
  }
  let collectiveResponse = [...idInfo.ids];
  const promises = collectiveResponse.map(async (requestId) => {
    return {
      requestId: requestId,
      result: await findStatusById(requestId),
    };
  });
  collectiveResponse = await Promise.all(promises);
  return res.json({
    status: 200,
    results: collectiveResponse,
  });
}

/** API to get single Job status */
async function getJobStatusHandler(req, res) {
  const { id } = req.params;
  const status = await findStatusById(id);
  if (status && status !== "404 Request not found.") {
    return res.json({
      status: 200,
      requestId: id,
      result: status,
    });
  } else {
    return res.json({
      status: 404,
      requestId: id,
      message: "Request not found.",
    });
  }
}

/** Internal Api to find the status from requestID */
async function findStatusById(requestId) {
  let sql = `Select requestStatus from jobservice_request where requestId = ${JSON.stringify(
    requestId
  )};`;
  const [result, fields] = await connection.query(sql);
  if (result.length == 0) {
    return "404 Request not found.";
  } else if (result[0].requestStatus == "JOB_SUBMIT_SUCCESS") {
    return await getResultsFromWorkerCloudAPI(requestId).toPromise();
  } else {
    return result[0].requestStatus;
  }
}

/** API to get status from external service */
function getResultsFromWorkerCloudAPI(requestId) {
  return new Observable((observer) => {
    const url = `http://${process.env.WORKER_CLOUD_API_URL}/api/v1/job/${requestId}/status`;
    const request = http.get(url, (res) => {
      let result = "";
      res.on("data", (data) => {
        data = data.toString("utf8");
        data = JSON.parse(data);
        if (data && data.result) {
          result = data.result;
        } else {
          result = null;
        }
        observer.next(result);
      });
      res.on("end", () => {
        observer.complete();
      });
    });

    request.on("error", (error) => {
      return error;
    });
  });
}

/** Internal API to update newStatus for request in DB table jobservice_request */
async function updateStatusQuery(newStatus, requestId) {
  let sql = `update jobservice_request set requestStatus = ${JSON.stringify(
    newStatus
  )} where requestId = ${requestId};`;
  const [result, fields] = await connection.query(sql);
  return result;
}

module.exports = {
  createJobHandler,
  getMultipleJobStatusHandler,
  getJobStatusHandler,
};
