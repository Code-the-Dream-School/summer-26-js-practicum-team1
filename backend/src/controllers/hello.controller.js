const { getHelloMessage } = require('../services/hello.service');

const getHello = (req, res) => {
  const name = req.query.name;
  const message = getHelloMessage(name);

  res.json({
    success: true,
    data: { message },
  });
};

module.exports = { getHello };
