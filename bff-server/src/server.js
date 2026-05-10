require('dotenv').config();

const app = require('./app');
const { connectDatabase } = require('./adapters/mysql');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectDatabase();
    console.log('MySQL connected successfully');

    app.listen(PORT, () => {
      console.log(`BFF Server running on port ${PORT}`);
      console.log(`API Documentation available at http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error('Failed to connect to MySQL:', error.message);
    process.exit(1);
  }
}

startServer();
