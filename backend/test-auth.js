import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const testAuth = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');

    // Test 1: Check if admin user exists
    const adminUser = await User.findOne({ email: 'admin@test.com' });
    if (!adminUser) {
      console.log('⚠️  No admin user found. Creating one...');
      
      const user = new User({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@test.com',
        password: 'admin123',
        role: 'admin',
        department: 'IT',
        position: 'System Administrator'
      });
      
      await user.save();
      console.log('✅ Admin user created');
    } else {
      console.log('✅ Admin user exists');
    }

    // Test 2: Test password hashing
    const testUser = new User({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@test.com',
      password: 'test123',
      role: 'employee',
      department: 'Testing',
      position: 'Tester'
    });

    await testUser.save();
    console.log('✅ Test user created');

    // Test 3: Test password matching
    const foundUser = await User.findOne({ email: 'test@test.com' }).select('+password');
    const isMatch = await foundUser.matchPassword('test123');
    console.log('✅ Password match test:', isMatch ? 'PASS' : 'FAIL');

    // Clean up
    await User.deleteOne({ email: 'test@test.com' });
    console.log('✅ Test user cleaned up');

    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
};

testAuth();