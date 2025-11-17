import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

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

async function quickCreate() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  // Delete if exists
  await User.deleteOne({ email: 'admin@company.com' });
  
  // Create user
  const user = new User({
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@company.com',
    password: await bcrypt.hash('admin123', 10),
    role: 'admin',
    department: 'IT',
    position: 'Admin'
  });
  
  await user.save();
  console.log('✅ User created: admin@company.com / admin123');
  process.exit();
}

quickCreate();