import express from 'express';
import { body, validationResult } from 'express-validator';
import Employee from '../models/Employee.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// @desc    Get all employees
// @route   GET /api/employees
// @access  Private (All authenticated users, but with data filtering)
router.get('/', protect, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, department, status } = req.query;
    
    let query = {};
    
    // Regular employees can only see basic employee info (not sensitive data)
    if (req.user.role === 'employee') {
      query.status = 'Active'; // Only show active employees to regular employees
    }
    
    if (search) {
      query.$or = [
        { 'personalDetails.firstName': { $regex: search, $options: 'i' } },
        { 'personalDetails.lastName': { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (department && req.user.role !== 'employee') {
      query['jobDetails.department'] = department;
    }
    
    if (status && req.user.role !== 'employee') {
      query.status = status;
    }

    const employees = await Employee.find(query)
      .populate('user', 'firstName lastName email')
      .populate('jobDetails.manager', 'personalDetails.firstName personalDetails.lastName')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Employee.countDocuments(query);

    res.json({
      employees,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
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
// @access  Private (HR, Admin)
router.post('/', [
  protect,
  authorize('admin', 'hr'),
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