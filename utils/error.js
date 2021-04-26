exports.internalServerError = (errorObj, next) => {
    const error = new Error(errorObj);
    error.httpStatusCode = 500;

    // vai ser tratado por um tipo especial de middleware (error middleware)
    return next(error);
};
