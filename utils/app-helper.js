exports.createError = (errCode, errMessage, data) => {
    const error = new Error(errMessage);
    error.statusCode = errCode;
    error.data = data;
    return error;
};