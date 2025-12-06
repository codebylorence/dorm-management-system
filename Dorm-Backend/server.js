const express = require('express');
const cors = require('cors');
require('dotenv').config();

const sequelize = require('./config/database');
const tenantRoutes = require('./routes/tenantRoutes');
const unitRoutes = require('./routes/unitRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Dorm Management System API' });
});

app.use('/api/tenants', tenantRoutes);
app.use('/api/units', unitRoutes);

// Database connection and server start
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    await sequelize.sync({ alter: true });
    console.log('Database synchronized.');
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

startServer();
