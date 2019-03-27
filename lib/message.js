const uuidv4 = require('uuid/v4');

const newRequest = (body) => {
  let id = uuidv4();
  return { id, body };
};

const newResponse = (id, body) => {
  return { id, body };
}

const newErrorResponse = (id, err) => {
  return { id, error: err };
}

module.exports = {
  newRequest, newResponse,
};
