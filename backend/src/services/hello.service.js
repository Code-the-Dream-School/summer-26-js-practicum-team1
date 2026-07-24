const getHelloMessage = (name) => {
  if (name) {
    return `Hello, ${name}`;
  }

  return 'Hello World';
};

module.exports = { getHelloMessage };
