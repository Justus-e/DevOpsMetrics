const checkApiKey = () => (req, res, next) => {
    const isValid = (key) => {
        return key === process.env.API_KEY
    }

    if (!isValid(req.header('X-API-KEY'))) {
        return res.status(401).json({status: 'Unauthorized'});
    }
    next();
};

module.exports = checkApiKey;
