import express from 'express';
import { body, validationResult } from 'express-validator';
import Project from '../models/Project.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// @desc    Get all projects
// @route   GET /api/projects
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, priority } = req.query;
    
    let query = {};
    
    // Regular employees can only see projects they're assigned to
    if (req.user.role === 'employee') {
      query.$or = [
        { manager: req.user.id },
        { 'teamMembers.user': req.user.id }
      ];
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status) {
      query.status = status;
    }
    
    if (priority) {
      query.priority = priority;
    }

    const projects = await Project.find(query)
      .populate('client', 'companyName contactPerson')
      .populate('manager', 'firstName lastName email')
      .populate('teamMembers.user', 'firstName lastName email position')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Project.countDocuments(query);

    res.json({
      projects,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('client', 'companyName contactPerson contactDetails')
      .populate('manager', 'firstName lastName email')
      .populate('teamMembers.user', 'firstName lastName email position department')
      .populate('documents.uploadedBy', 'firstName lastName');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user has access to this project
    if (req.user.role === 'employee' && 
        project.manager._id.toString() !== req.user.id && 
        !project.teamMembers.some(member => member.user._id.toString() === req.user.id)) {
      return res.status(403).json({ message: 'Access denied to this project' });
    }

    res.json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Create project
// @route   POST /api/projects
// @access  Private (Admin, Client Manager)
router.post('/', [
  protect,
  authorize('admin', 'client_manager'),
  body('title').notEmpty().withMessage('Project title is required'),
  body('description').notEmpty().withMessage('Project description is required'),
  body('client').isMongoId().withMessage('Valid client ID is required'),
  body('timeline.startDate').isDate().withMessage('Valid start date is required'),
  body('timeline.endDate').isDate().withMessage('Valid end date is required'),
  body('budget.estimated').isNumeric().withMessage('Estimated budget must be a number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Generate project ID
    const lastProject = await Project.findOne().sort({ createdAt: -1 });
    let projectId = 'PROJ001';
    if (lastProject && lastProject.projectId) {
      const lastNumber = parseInt(lastProject.projectId.replace('PROJ', ''));
      projectId = `PROJ${(lastNumber + 1).toString().padStart(3, '0')}`;
    }

    const projectData = {
      ...req.body,
      projectId,
      manager: req.user.id
    };

    const project = await Project.create(projectData);
    await project.populate('client', 'companyName contactPerson');

    res.status(201).json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private (Admin, Client Manager, Project Manager)
router.put('/:id', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user can update this project
    if (req.user.role === 'employee' && project.manager.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('client', 'companyName contactPerson')
     .populate('manager', 'firstName lastName email');

    res.json(updatedProject);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Add team member to project
// @route   POST /api/projects/:id/team
// @access  Private (Admin, Client Manager, Project Manager)
router.post('/:id/team', [
  protect,
  body('user').isMongoId().withMessage('Valid user ID is required'),
  body('role').notEmpty().withMessage('Role is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user can modify team
    if (req.user.role === 'employee' && project.manager.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if user is already in team
    const existingMember = project.teamMembers.find(
      member => member.user.toString() === req.body.user
    );
    
    if (existingMember) {
      return res.status(400).json({ message: 'User is already in the project team' });
    }

    project.teamMembers.push(req.body);
    await project.save();

    await project.populate('teamMembers.user', 'firstName lastName email position');
    res.json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;