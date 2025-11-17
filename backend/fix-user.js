import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

// Simple user schema without validation errors
const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  password: String,
  role: String,
  department: String,
  position: String
});

const User = mongoose.model('User', userSchema);

async function fixUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Delete any existing problematic users
    await User.deleteMany({});
    console.log('Cleared all users');

    // Create fresh admin user
    const adminUser = new User({
      firstName: 'Admin',
      lastName: 'User', // This should work now
      email: 'admin@company.com',
      password: await bcrypt.hash('admin123', 10),
      role: 'admin',
      department: 'IT',
      position: 'System Administrator'
    });

    await adminUser.save();
    console.log('✅ Admin user created successfully!');
    console.log('Email: admin@company.com');
    console.log('Password: admin123');

    // Create test employee user
    const employeeUser = new User({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@company.com',
      password: await bcrypt.hash('password123', 10),
      role: 'employee',
      department: 'HR',
      position: 'HR Manager'
    });

    await employeeUser.save();
    console.log('✅ Employee user created successfully!');
    console.log('Email: john.doe@company.com');
    console.log('Password: password123');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixUser();