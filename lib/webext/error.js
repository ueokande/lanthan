'use strict';

class HttpError {
  constructor(message, status) {
    this.message = message;
    this.status = status;
  }
}

class BadRequestError extends HttpError {
  constructor(message) {
    super(message, 400);
  }
}

class NotAcceptableError extends HttpError {
  constructor(message) {
    super(message, 406);
  }
}

class NotFoundError extends HttpError {
  constructor(message) {
    super(message, 404);
  }
}

module.exports = {
  HttpError,
  BadRequestError,
  NotAcceptableError,
  NotFoundError,
};
