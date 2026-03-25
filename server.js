require('dotenv').config();
const app = require('./src/app');
const { startNewsJob } = require('./src/jobs/newsJob');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`[Server] API corriendo en http://localhost:${PORT}`);
  startNewsJob();
});
