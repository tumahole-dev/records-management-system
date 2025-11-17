import express from 'express';
import { protect } from '../middleware/auth.js';
import Employee from '../models/Employee.js';
import Client from '../models/Client.js';
import Project from '../models/Project.js';
import Document from '../models/Document.js';
import User from '../models/User.js';

const router = express.Router();

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    const totalEmployees = await Employee.countDocuments({ status: 'Active' });
    const totalClients = await Client.countDocuments({ status: 'Active' });
    const totalProjects = await Project.countDocuments();
    const totalDocuments = await Document.countDocuments({ isArchived: false });
    const totalUsers = await User.countDocuments({ isActive: true });

    // Projects by status
    const projectsByStatus = await Project.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Employees by department
    const employeesByDepartment = await Employee.aggregate([
      {
        $group: {
          _id: '$jobDetails.department',
          count: { $sum: 1 }
        }
      }
    ]);

    // Recent activities (last 10 documents uploaded)
    const recentDocuments = await Document.find({ isArchived: false })
      .populate('uploadedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(10);

    // Upcoming project milestones (next 30 days)
    const upcomingMilestones = await Project.aggregate([
      { $unwind: '$timeline.milestones' },
      {
        $match: {
          'timeline.milestones.dueDate': {
            $gte: new Date(),
            $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // next 30 days
          },
          'timeline.milestones.status': { $in: ['Pending', 'In Progress'] }
        }
      },
      {
        $project: {
          projectTitle: '$title',
          milestone: '$timeline.milestones.title',
          dueDate: '$timeline.milestones.dueDate',
          status: '$timeline.milestones.status'
        }
      },
      { $sort: { dueDate: 1 } },
      { $limit: 10 }
    ]);

    res.json({
      totalEmployees,
      totalClients,
      totalProjects,
      totalDocuments,
      totalUsers,
      projectsByStatus,
      employeesByDepartment,
      recentActivities: recentDocuments.map(doc => ({
        type: 'document_upload',
        title: `New document: ${doc.title}`,
        user: doc.uploadedBy,
        timestamp: doc.createdAt
      })),
      upcomingMilestones
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get recent activities
// @route   GET /api/dashboard/activities
// @access  Private
router.get('/activities', protect, async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    // Get recent documents
    const recentDocuments = await Document.find({ isArchived: false })
      .populate('uploadedBy', 'firstName lastName')
      .populate('relatedTo.modelId')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    // Get recent user logins
    const recentLogins = await User.find({ 
      lastLogin: { $exists: true },
      _id: { $ne: req.user.id } // Exclude current user
    })
      .select('firstName lastName lastLogin role')
      .sort({ lastLogin: -1 })
      .limit(5);

    const activities = [
      ...recentDocuments.map(doc => ({
        type: 'document_upload',
        title: `Uploaded ${doc.title}`,
        description: `New ${doc.category} document uploaded`,
        user: doc.uploadedBy,
        timestamp: doc.createdAt,
        metadata: {
          documentId: doc._id,
          category: doc.category
        }
      })),
      ...recentLogins.map(user => ({
        type: 'user_login',
        title: `${user.firstName} ${user.lastName} logged in`,
        description: `${user.role} user accessed the system`,
        user: user,
        timestamp: user.lastLogin,
        metadata: {
          role: user.role
        }
      }))
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
     .slice(0, limit);

    res.json(activities);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;