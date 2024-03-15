class ApiResponse {
  constructor(statusCode, data, message = "Success") {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
  }
} //explaination: ApiResponse is a class that is used to create a response object that can be sent to the client. It takes three parameters statusCode, data, and message. The statusCode is the status code of the response. The data is the data to be sent in the response. The message is the message of the response. The constructor of the class sets the properties of the response object. The success property is set to true if the statusCode is less than 400. The class is exported
