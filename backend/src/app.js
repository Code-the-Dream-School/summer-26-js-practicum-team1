const express = require('express');
const { applyMiddleware } = require('./middleware');
const { notFound, errorHandler } = require('./middleware/error.middleware');
const helloRoutes = require('./routes/hello.routes');
const authRoutes = require('./routes/auth.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();

applyMiddleware(app);

app.use('/api/hello', helloRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('Backend API is running');
});

app.use(notFound);
app.use(errorHandler);

module.exports = app;
