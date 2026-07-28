require('dotenv').config();
const app = require('./src/app');
const { PORT } = require('./src/utils/constants');

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
