const CircularJSON = require('circular-json');

module.exports = (status, body) => {
  return {
    statusCode: status,
    headers: {
      "Access-Control-Allow-Origin": "*"    
    },
    body: CircularJSON.stringify(body)
  }
}
