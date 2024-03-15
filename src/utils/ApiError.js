class ApiError extends Error {
  constructor(
    statusCode,
    message = "Something went wrong",
    errors = [],
    stack = ""
  ) {
    super(message);
    this.statusCode = statusCode;
    this.data = null;
    this.message = message;
    this.success = false;
    this.errors = errors;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
} // explaination:  ApiError is a class that extends the Error class. It is used to create an error object that can be used to send the error response to the client. It takes four parameters statusCode, message, errors, and stack. The statusCode is the status code of the error. The message is the error message. The errors are the array of errors. The stack is the stack trace of the error. The constructor of the class sets the properties of the error object. The success property is set to false if the statusCode is greater than or equal to 400. The stack property is set to the stack trace of the error if it is provided. Otherwise, it captures the stack trace of the error using the Error.captureStackTrace method. The class is exported from the file.
export { ApiError };
