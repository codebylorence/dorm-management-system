const readline = require('readline');
const User = require('../models/User');
const sequelize = require('../config/database');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
};

const createAdminUser = async () => {
  try {
    // Connect to database
    await sequelize.authenticate();
    console.log('Database connection established successfully.\n');
    
    // Sync models
    await sequelize.sync();
    
    console.log('=== Create Admin User ===\n');
    
    const username = await question('Enter username: ');
    const email = await question('Enter email: ');
    const password = await question('Enter password: ');
    const fullName = await question('Enter full name: ');
    const phone = await question('Enter phone (optional): ');
    
    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        [require('sequelize').Op.or]: [
          { username },
          { email }
        ]
      }
    });
    
    if (existingUser) {
      console.log('\n❌ Error: Username or email already exists!');
      rl.close();
      process.exit(1);
    }
    
    // Create admin user
    const admin = await User.create({
      username,
      email,
      password,
      fullName,
      phone: phone || null,
      role: 'admin',
      status: 'active'
    });
    
    console.log('\n✅ Admin user created successfully!');
    console.log('\nUser Details:');
    console.log('-------------');
    console.log(`ID: ${admin.id}`);
    console.log(`Username: ${admin.username}`);
    console.log(`Email: ${admin.email}`);
    console.log(`Full Name: ${admin.fullName}`);
    console.log(`Role: ${admin.role}`);
    console.log(`Status: ${admin.status}`);
    
    rl.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error creating admin user:', error.message);
    rl.close();
    process.exit(1);
  }
};

createAdminUser();

