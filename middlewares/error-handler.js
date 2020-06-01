const errorHandlerMiddleware = (err, req, res, next) => {
    const status = err.statusCode || 500;
    const message = err.message;
    const errors = err.data;
    res.status(status).json({
        message,
        errors
    });
};

module.exports = errorHandlerMiddleware;