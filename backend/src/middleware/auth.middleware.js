function mockAuth(req, res, next) {
    req.user = {
        id: 1,
        role: "ADMIN"
    };

    next();
}

module.exports = mockAuth;