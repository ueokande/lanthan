class HttpError {
  constructor(
    public message: string,
    public status: number,
  ) {
  }
}

class BadRequestError extends HttpError {
  constructor(public message: string) {
    super(message, 400);
  }
}

class NotAcceptableError extends HttpError {
  constructor(public message: string) {
    super(message, 406);
  }
}

class NotFoundError extends HttpError {
  constructor(public message: string) {
    super(message, 404);
  }
}

export {
  HttpError,
  BadRequestError,
  NotAcceptableError,
  NotFoundError,
};
