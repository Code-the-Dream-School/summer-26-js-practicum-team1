const { getHelloMessage } = require('../services/hello.service');

function getHello(req, res) {
  res.json(getHelloMessage());
}

module.exports = { getHello };
