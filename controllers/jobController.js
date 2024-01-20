/* Handler */
function createJobHandler(req, res) {
  //console.log(req.userInfo);
  res.json({
    status: 200,
    message: "Data found",
    claims: req.userInfo,
  });
}

module.exports = { createJobHandler };
