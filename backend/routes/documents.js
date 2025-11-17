import express from 'express';
import multer from 'multer';
import path from 'path';
import { body, validationResult } from 'express-validator';
import Document from '../models/Document.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx|xls|xlsx|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only document files are allowed'));
    }
  }
});

// @desc    Upload document
// @route   POST /api/documents/upload
// @access  Private
router.post('/upload', [
  protect,
  upload.single('document'),
  body('title').notEmpty().withMessage('Document title is required'),
  body('category').isIn(['Employee', 'Client', 'Project', 'Contract', 'Financial', 'Other']).withMessage('Valid category is required'),
  body('relatedTo.modelType').isIn(['Employee', 'Client', 'Project', 'User']).withMessage('Valid model type is required'),
  body('relatedTo.modelId').isMongoId().withMessage('Valid model ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }

    // Generate document ID
    const lastDoc = await Document.findOne().sort({ createdAt: -1 });
    let documentId = 'DOC001';
    if (lastDoc && lastDoc.documentId) {
      const lastNumber = parseInt(lastDoc.documentId.replace('DOC', ''));
      documentId = `DOC${(lastNumber + 1).toString().padStart(3, '0')}`;
    }

    const document = await Document.create({
      documentId,
      title: req.body.title,
      description: req.body.description,
      fileName: req.file.originalname,
      fileUrl: `/uploads/${req.file.filename}`,
      fileSize: req.file.size,
      fileType: path.extname(req.file.originalname),
      category: req.body.category,
      relatedTo: {
        modelType: req.body.relatedTo.modelType,
        modelId: req.body.relatedTo.modelId
      },
      accessControl: req.body.accessControl || {
        view: ['admin', 'hr', 'client_manager'],
        edit: ['admin', 'hr']
      },
      uploadedBy: req.user.id
    });

    await document.populate('uploadedBy', 'firstName lastName');
    await document.populate('relatedTo.modelId');

    res.status(201).json(document);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get all documents
// @route   GET /api/documents
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, category, modelType } = req.query;
    
    let query = { isArchived: false };
    
    // Filter by user's role access
    query['accessControl.view'] = { $in: [req.user.role] };
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { fileName: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category) {
      query.category = category;
    }
    
    if (modelType) {
      query['relatedTo.modelType'] = modelType;
    }

    const documents = await Document.find(query)
      .populate('uploadedBy', 'firstName lastName')
      .populate('relatedTo.modelId')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Document.countDocuments(query);

    res.json({
      documents,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get single document
// @route   GET /api/documents/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate('uploadedBy', 'firstName lastName')
      .populate('relatedTo.modelId')
      .populate('version.history.updatedBy', 'firstName lastName');

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Check access control
    if (!document.accessControl.view.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied to this document' });
    }

    res.json(document);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Update document
// @route   PUT /api/documents/:id
// @access  Private
router.put('/:id', [
  protect,
  body('title').optional().notEmpty().withMessage('Title cannot be empty')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Check edit access
    if (!document.accessControl.edit.includes(req.user.role)) {
      return res.status(403).json({ message: 'No permission to edit this document' });
    }

    const updatedDocument = await Document.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('uploadedBy', 'firstName lastName');

    res.json(updatedDocument);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Archive document
// @route   PUT /api/documents/:id/archive
// @access  Private (Admin, HR)
router.put('/:id/archive', protect, authorize('admin', 'hr'), async (req, res) => {
  try {
    const document = await Document.findByIdAndUpdate(
      req.params.id,
      { isArchived: true },
      { new: true }
    );

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.json({ message: 'Document archived successfully', document });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;