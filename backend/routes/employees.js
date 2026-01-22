import express from 'express';
import { body, validationResult } from 'express-validator';
import Employee from '../models/Employee.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// @desc    Get all employees
// @route   GET /api/employees
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    console.log('📞 GET /api/employees - User:', req.user);
    
    // Build query based on user role
    let query = {};
    
    // Regular employees can only see their own record
    if (req.user.role === 'employee') {
      // Find employee where user ID matches logged-in user
      const employeeRecord = await Employee.findOne({ user: req.user.id });
      if (!employeeRecord) {
        return res.json({ 
          success: true, 
          employees: [],
          total: 0,
          message: 'No employee record found for user'
        });
      }
      query = { _id: employeeRecord._id }; // Only return their own record
    }
    
    // Apply search filters for managers/admins
    if (req.user.role !== 'employee') {
      const { search, department, status } = req.query;
      
      if (search) {
        query.$or = [
          { 'personalDetails.firstName': { $regex: search, $options: 'i' } },
          { 'personalDetails.lastName': { $regex: search, $options: 'i' } },
          { employeeId: { $regex: search, $options: 'i' } },
          { 'personalDetails.personalEmail': { $regex: search, $options: 'i' } }
        ];
      }
      
      if (department) {
        query['jobDetails.department'] = department;
      }
      
      if (status) {
        query.status = status;
      }
    }

    console.log('Query for employees:', query);

    // Populate user with correct fields from User model
    const employees = await Employee.find(query)
      .populate('user', 'firstName lastName email role department position') // User model fields
      .populate('jobDetails.manager', 'personalDetails.firstName personalDetails.lastName employeeId')
      .sort({ createdAt: -1 })
      .limit(50); // Increased limit for testing

    const total = await Employee.countDocuments(query);

    console.log(`✅ Found ${employees.length} employees`);

    res.json({
      success: true,
      employees,
      total,
      userRole: req.user.role // For debugging
    });
    
  } catch (error) {
    console.error('❌ Employee fetch error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// @desc    Get single employee
// @route   GET /api/employees/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate('user', 'firstName lastName email')
      .populate('jobDetails.manager', 'personalDetails.firstName personalDetails.lastName');

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Check if user has permission to view this employee
    if (req.user.role === 'employee' && employee.user._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(employee);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Create employee
// @route   POST /api/employees
// @access  Private (HR, Admin, Client Manager)
router.post('/', [
  protect,
  authorize('admin', 'hr', 'client_manager'), // Added client_manager
  body('personalDetails.firstName').notEmpty().withMessage('First name is required'),
  body('personalDetails.lastName').notEmpty().withMessage('Last name is required'),
  body('personalDetails.dateOfBirth').isDate().withMessage('Valid date of birth is required'),
  body('jobDetails.department').notEmpty().withMessage('Department is required'),
  body('jobDetails.position').notEmpty().withMessage('Position is required'),
  body('jobDetails.hireDate').isDate().withMessage('Valid hire date is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Generate employee ID
    const lastEmployee = await Employee.findOne().sort({ createdAt: -1 });
    let employeeId = 'EMP001';
    if (lastEmployee && lastEmployee.employeeId) {
      const lastNumber = parseInt(lastEmployee.employeeId.replace('EMP', ''));
      employeeId = `EMP${(lastNumber + 1).toString().padStart(3, '0')}`;
    }

    const employeeData = {
      ...req.body,
      employeeId,
      user: req.user.id
    };

    const employee = await Employee.create(employeeData);

    res.status(201).json(employee);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Update employee
// @route   PUT /api/employees/:id
// @access  Private (HR, Admin)
router.put('/:id', protect, authorize('admin', 'hr'), async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json(employee);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Delete employee
// @route   DELETE /api/employees/:id
// @access  Private (Admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    await Employee.findByIdAndDelete(req.params.id);
    res.json({ message: 'Employee removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;