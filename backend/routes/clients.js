import express from 'express';
import { body, validationResult } from 'express-validator';
import Client from '../models/Client.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// @desc    Get all clients
// @route   GET /api/clients
// @access  Private (Admin, HR, Client Manager)
router.get('/', protect, authorize('admin', 'hr', 'client_manager'), async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status } = req.query;
    
    let query = {};
    
    if (search) {
      query.$or = [
        { companyName: { $regex: search, $options: 'i' } },
        { 'contactPerson.firstName': { $regex: search, $options: 'i' } },
        { 'contactPerson.lastName': { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status) {
      query.status = status;
    }

    const clients = await Client.find(query)
      .populate('assignedManager', 'firstName lastName email')
      .populate('projects', 'title status')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Client.countDocuments(query);

    res.json({
      clients,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get single client
// @route   GET /api/clients/:id
// @access  Private (Admin, HR, Client Manager)
router.get('/:id', protect, authorize('admin', 'hr', 'client_manager'), async (req, res) => {
  try {
    const client = await Client.findById(req.params.id)
      .populate('assignedManager', 'firstName lastName email')
      .populate('projects', 'title status timeline');

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    res.json(client);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Create client
// @route   POST /api/clients
// @access  Private (Admin, Client Manager)
router.post('/', [
  protect,
  authorize('admin', 'client_manager'),
  body('companyName').notEmpty().withMessage('Company name is required'),
  body('contactPerson.firstName').notEmpty().withMessage('Contact first name is required'),
  body('contactPerson.lastName').notEmpty().withMessage('Contact last name is required'),
  body('contactDetails.email').isEmail().withMessage('Valid email is required'),
  body('contactDetails.phone').notEmpty().withMessage('Phone number is required'),
  body('assignedManager').isMongoId().withMessage('Valid manager ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Generate client ID
    const lastClient = await Client.findOne().sort({ createdAt: -1 });
    let clientId = 'CLI001';
    if (lastClient && lastClient.clientId) {
      const lastNumber = parseInt(lastClient.clientId.replace('CLI', ''));
      clientId = `CLI${(lastNumber + 1).toString().padStart(3, '0')}`;
    }

    const clientData = {
      ...req.body,
      clientId
    };

    const client = await Client.create(clientData);
    await client.populate('assignedManager', 'firstName lastName email');

    res.status(201).json(client);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Update client
// @route   PUT /api/clients/:id
// @access  Private (Admin, Client Manager)
router.put('/:id', protect, authorize('admin', 'client_manager'), async (req, res) => {
  try {
    const client = await Client.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('assignedManager', 'firstName lastName email');

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    res.json(client);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Add contract to client
// @route   POST /api/clients/:id/contracts
// @access  Private (Admin, Client Manager)
router.post('/:id/contracts', [
  protect,
  authorize('admin', 'client_manager'),
  body('title').notEmpty().withMessage('Contract title is required'),
  body('startDate').isDate().withMessage('Valid start date is required'),
  body('endDate').isDate().withMessage('Valid end date is required'),
  body('value').isNumeric().withMessage('Contract value must be a number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    client.contracts.push(req.body);
    await client.save();

    res.json(client);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;