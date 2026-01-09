const cron = require('node-cron');
const Payment = require('../models/Payment');
const { Op } = require('sequelize');

// Function to update overdue payments
const updateOverduePayments = async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Find all unpaid payments that are past due date
    const result = await Payment.update(
      { status: 'Late' },
      {
        where: {
          dueDate: {
            [Op.lt]: today
          },
          status: 'Unpaid'
        }
      }
    );
    
    console.log(`[${new Date().toISOString()}] Updated ${result[0]} payments to overdue status`);
    return result[0];
  } catch (error) {
    console.error('Error updating overdue payments:', error);
    return 0;
  }
};

// Schedule the task to run daily at midnight
const startScheduler = () => {
  // Run every day at midnight (00:00)
  cron.schedule('0 0 * * *', async () => {
    console.log('Running daily overdue payment check...');
    await updateOverduePayments();
  });
  
  // Also run every hour during business hours (9 AM to 6 PM)
  cron.schedule('0 9-18 * * *', async () => {
    console.log('Running hourly overdue payment check...');
    await updateOverduePayments();
  });
  
  console.log('Payment scheduler started - checking for overdue payments daily at midnight and hourly during business hours');
};

module.exports = {
  startScheduler,
  updateOverduePayments
};