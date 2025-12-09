const express = require('express');
const cors = require('cors');
require('dotenv').config();

const sequelize = require('./config/database');

// Import models
const Tenant = require('./models/Tenant');
const Unit = require('./models/Unit');
const Payment = require('./models/Payment');
const User = require('./models/User');

// Import routes
const tenantRoutes = require('./routes/tenantRoutes');
const unitRoutes = require('./routes/unitRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Define model associations
Tenant.hasMany(Payment, { foreignKey: 'tenantId', onDelete: 'CASCADE' });
Payment.belongsTo(Tenant, { foreignKey: 'tenantId' });

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Dorm Management System API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      tenants: '/api/tenants',
      units: '/api/units',
      payments: '/api/payments'
    }
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tenants', tenantRoutes);
app.use('/api/units', unitRoutes);
app.use('/api/payments', paymentRoutes);

// Database connection and server start
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    await sequelize.sync({ alter: true });
    console.log('Database synchronized.');
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`API available at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

startServer();
