const uuidv4 = require('uuid/v4');

const newRequest = (body) => {
  let id = uuidv4();
  return { id, body };
};
module.exports = {
  newRequest
};
