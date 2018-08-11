const jwt = require('jsonwebtoken');

module.exports = (event, secret) => {
  const authHeader = (event && event.headers && event.headers.Authorization) ? event.headers.Authorization : null;
  if (authHeader == null) {
    return 'No authorization';
  } else {
    try {
      var decoded = jwt.verify(authHeader, secret);
    } catch(error) {
      return 'Error decoding token';
    }
  
    return (decoded) ? decoded : 'Invalid token';
  }
}
