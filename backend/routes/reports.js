import express from 'express';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { protect, authorize } from '../middleware/auth.js';
import Employee from '../models/Employee.js';
import Client from '../models/Client.js';
import Project from '../models/Project.js';
import Document from '../models/Document.js';

const router = express.Router();

// @desc    Generate employees report
// @route   POST /api/reports/employees
// @access  Private (Admin, HR)
router.post('/employees', protect, authorize('admin', 'hr'), async (req, res) => {
  try {
    const { format = 'excel', filters = {} } = req.body;

    // Build query based on filters
    let query = {};
    if (filters.department) {
      query['jobDetails.department'] = filters.department;
    }
    if (filters.status) {
      query.status = filters.status;
    }
    if (filters.employmentType) {
      query['jobDetails.employmentType'] = filters.employmentType;
    }

    const employees = await Employee.find(query)
      .populate('user', 'firstName lastName email')
      .populate('jobDetails.manager', 'personalDetails.firstName personalDetails.lastName');

    if (format === 'excel') {
      // Generate Excel report
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Employees');

      // Add headers
      worksheet.columns = [
        { header: 'Employee ID', key: 'employeeId', width: 15 },
        { header: 'First Name', key: 'firstName', width: 15 },
        { header: 'Last Name', key: 'lastName', width: 15 },
        { header: 'Email', key: 'email', width: 25 },
        { header: 'Department', key: 'department', width: 20 },
        { header: 'Position', key: 'position', width: 20 },
        { header: 'Hire Date', key: 'hireDate', width: 15 },
        { header: 'Employment Type', key: 'employmentType', width: 15 },
        { header: 'Salary', key: 'salary', width: 15 },
        { header: 'Status', key: 'status', width: 15 }
      ];

      // Add data
      employees.forEach(employee => {
        worksheet.addRow({
          employeeId: employee.employeeId,
          firstName: employee.personalDetails.firstName,
          lastName: employee.personalDetails.lastName,
          email: employee.user.email,
          department: employee.jobDetails.department,
          position: employee.jobDetails.position,
          hireDate: employee.jobDetails.hireDate.toISOString().split('T')[0],
          employmentType: employee.jobDetails.employmentType,
          salary: employee.jobDetails.salary,
          status: employee.status
        });
      });

      // Set response headers
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=employees_report.xlsx');

      // Write to response
      await workbook.xlsx.write(res);
      res.end();

    } else if (format === 'pdf') {
      // Generate PDF report
      const doc = new PDFDocument();
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=employees_report.pdf');
      
      doc.pipe(res);

      // Add content
      doc.fontSize(20).text('Employees Report', { align: 'center' });
      doc.moveDown();
      
      employees.forEach((employee, index) => {
        doc.fontSize(12)
           .text(`${index + 1}. ${employee.personalDetails.firstName} ${employee.personalDetails.lastName}`, { continued: true })
           .text(` - ${employee.jobDetails.department}`, { align: 'right' });
        doc.text(`   ID: ${employee.employeeId} | Email: ${employee.user.email}`);
        doc.text(`   Position: ${employee.jobDetails.position} | Status: ${employee.status}`);
        doc.moveDown(0.5);
      });

      doc.end();
    } else {
      res.status(400).json({ message: 'Invalid format. Use "excel" or "pdf"' });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Generate projects report
// @route   POST /api/reports/projects
// @access  Private
router.post('/projects', protect, async (req, res) => {
  try {
    const { format = 'excel', filters = {} } = req.body;

    let query = {};
    
    // Regular employees can only see their projects
    if (req.user.role === 'employee') {
      query.$or = [
        { manager: req.user.id },
        { 'teamMembers.user': req.user.id }
      ];
    }
    
    if (filters.status) {
      query.status = filters.status;
    }
    if (filters.priority) {
      query.priority = filters.priority;
    }

    const projects = await Project.find(query)
      .populate('client', 'companyName')
      .populate('manager', 'firstName lastName')
      .populate('teamMembers.user', 'firstName lastName');

    if (format === 'excel') {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Projects');

      worksheet.columns = [
        { header: 'Project ID', key: 'projectId', width: 15 },
        { header: 'Title', key: 'title', width: 30 },
        { header: 'Client', key: 'client', width: 20 },
        { header: 'Manager', key: 'manager', width: 20 },
        { header: 'Start Date', key: 'startDate', width: 15 },
        { header: 'End Date', key: 'endDate', width: 15 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Priority', key: 'priority', width: 15 },
        { header: 'Budget', key: 'budget', width: 15 },
        { header: 'Team Size', key: 'teamSize', width: 15 }
      ];

      projects.forEach(project => {
        worksheet.addRow({
          projectId: project.projectId,
          title: project.title,
          client: project.client.companyName,
          manager: `${project.manager.firstName} ${project.manager.lastName}`,
          startDate: project.timeline.startDate.toISOString().split('T')[0],
          endDate: project.timeline.endDate.toISOString().split('T')[0],
          status: project.status,
          priority: project.priority,
          budget: project.budget.estimated,
          teamSize: project.teamMembers.length
        });
      });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=projects_report.xlsx');
      await workbook.xlsx.write(res);
      res.end();
    } else {
      res.status(400).json({ message: 'Only Excel format supported for projects report' });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get report statistics
// @route   GET /api/reports/stats
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    const totalEmployees = await Employee.countDocuments({ status: 'Active' });
    const totalClients = await Client.countDocuments({ status: 'Active' });
    const totalProjects = await Project.countDocuments();
    const totalDocuments = await Document.countDocuments({ isArchived: false });

    const projectsByStatus = await Project.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const employeesByDepartment = await Employee.aggregate([
      { $group: { _id: '$jobDetails.department', count: { $sum: 1 } } }
    ]);

    res.json({
      totalEmployees,
      totalClients,
      totalProjects,
      totalDocuments,
      projectsByStatus,
      employeesByDepartment
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;