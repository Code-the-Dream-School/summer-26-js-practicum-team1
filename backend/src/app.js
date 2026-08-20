const express = require('express');
const { applyMiddleware } = require('./middleware');
const { notFound, errorHandler } = require('./middleware/error.middleware');
const helloRoutes = require('./routes/hello.routes');
const authRoutes = require('./routes/auth.routes');
const adminRoutes = require('./routes/admin.routes');
const helpRequestRoutes = require('./routes/helpRequest.routes');
const requesterProfileRoutes = require('./routes/requesterProfile.routes');
const chatRoutes = require('./routes/chat.routes');
const volunteerProfileRoutes = require('./routes/volunteerProfile.routes');
const supportCategoriesRoutes = require('./routes/supportCategories.routes');

const app = express();

applyMiddleware(app);

app.use('/api/hello', helloRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/requests', helpRequestRoutes);
app.use('/api/profile/volunteer', volunteerProfileRoutes);
app.use('/api/profile', requesterProfileRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/support-categories', supportCategoriesRoutes);

app.get('/', (req, res) => {
  res.send('Backend API is running');
});

app.use(notFound);
app.use(errorHandler);

module.exports = app;
