module.exports = (req, res, next) => {
    if (!req.query.page) {
        req.query.page = 1;
    }

    next();
};
