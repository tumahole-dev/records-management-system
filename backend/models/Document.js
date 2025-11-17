import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  documentId: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: [true, 'Document title is required'],
    trim: true
  },
  description: String,
  fileName: {
    type: String,
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  fileType: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Employee', 'Client', 'Project', 'Contract', 'Financial', 'Other']
  },
  relatedTo: {
    modelType: {
      type: String,
      enum: ['Employee', 'Client', 'Project', 'User'],
      required: true
    },
    modelId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'relatedTo.modelType'
    }
  },
  version: {
    current: { type: Number, default: 1 },
    history: [{
      version: Number,
      changes: String,
      updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      updatedAt: { type: Date, default: Date.now },
      fileUrl: String
    }]
  },
  accessControl: {
    view: [{
      type: String,
      enum: ['admin', 'hr', 'client_manager', 'employee']
    }],
    edit: [{
      type: String,
      enum: ['admin', 'hr', 'client_manager', 'employee']
    }]
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isArchived: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

export default mongoose.model('Document', documentSchema);