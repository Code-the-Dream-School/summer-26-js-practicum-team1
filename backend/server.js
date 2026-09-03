require('dotenv').config();
const app = require('./src/app');
const { PORT } = require('./src/utils/constants');
const {
  startNotificationRetryLoop,
} = require('./src/services/notification.service');

startNotificationRetryLoop();

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
