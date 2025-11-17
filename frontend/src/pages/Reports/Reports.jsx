import React, { useState } from 'react'
import { useQuery } from 'react-query'
import { Download, BarChart3, Users, Building, FolderOpen, FileText } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

const Reports = () => {
  const [selectedReport, setSelectedReport] = useState('employees')
  const [format, setFormat] = useState('excel')
  const [filters, setFilters] = useState({})

  const { data: stats, isLoading: statsLoading } = useQuery(
    'report-stats',
    async () => {
      const response = await axios.get('/api/reports/stats')
      return response.data
    }
  )

  const generateReport = async () => {
    try {
      const response = await axios.post(
        `/api/reports/${selectedReport}`,
        { format, filters },
        { responseType: 'blob' }
      )

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      
      const extension = format === 'excel' ? 'xlsx' : 'pdf'
      link.setAttribute('download', `${selectedReport}_report.${extension}`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      toast.success('Report generated successfully')
    } catch (error) {
      toast.error('Failed to generate report')
      console.error(error)
    }
  }

  const reportTypes = [
    {
      id: 'employees',
      name: 'Employees Report',
      description: 'Detailed report of all employees with personal and job information',
      icon: Users,
      filters: ['department', 'status', 'employmentType']
    },
    {
      id: 'clients',
      name: 'Clients Report',
      description: 'Comprehensive client information and contract details',
      icon: Building,
      filters: ['status', 'industry']
    },
    {
      id: 'projects',
      name: 'Projects Report',
      description: 'Project timelines, budgets, and team assignments',
      icon: FolderOpen,
      filters: ['status', 'priority']
    },
    {
      id: 'documents',
      name: 'Documents Report',
      description: 'Document inventory with metadata and access logs',
      icon: FileText,
      filters: ['category', 'modelType']
    }
  ]

  if (statsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Employees</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalEmployees || 0}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <Building className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Clients</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalClients || 0}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <FolderOpen className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Projects</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalProjects || 0}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Documents</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalDocuments || 0}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Selection */}
        <div className="lg:col-span-1 space-y-4">
          <div className="card p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Report Type</h3>
            <div className="space-y-3">
              {reportTypes.map((report) => (
                <div
                  key={report.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedReport === report.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedReport(report.id)}
                >
                  <div className="flex items-center space-x-3">
                    <report.icon className="h-5 w-5 text-gray-600" />
                    <div>
                      <h4 className="font-medium text-gray-900">{report.name}</h4>
                      <p className="text-sm text-gray-500">{report.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Report Configuration */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Report Configuration</h3>
            
            <div className="space-y-4">
              {/* Format Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Output Format
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="excel"
                      checked={format === 'excel'}
                      onChange={(e) => setFormat(e.target.value)}
                      className="mr-2"
                    />
                    <span>Excel (.xlsx)</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="pdf"
                      checked={format === 'pdf'}
                      onChange={(e) => setFormat(e.target.value)}
                      className="mr-2"
                    />
                    <span>PDF (.pdf)</span>
                  </label>
                </div>
              </div>

              {/* Filters */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filters
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Dynamic filters based on selected report */}
                  {selectedReport === 'employees' && (
                    <>
                      <select
                        value={filters.department || ''}
                        onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                        className="input-field"
                      >
                        <option value="">All Departments</option>
                        <option value="IT">IT</option>
                        <option value="HR">HR</option>
                        <option value="Finance">Finance</option>
                        <option value="Marketing">Marketing</option>
                      </select>
                      
                      <select
                        value={filters.status || ''}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        className="input-field"
                      >
                        <option value="">All Status</option>
                        <option value="Active">Active</option>
                        <option value="On Leave">On Leave</option>
                        <option value="Terminated">Terminated</option>
                      </select>
                    </>
                  )}
                  
                  {selectedReport === 'projects' && (
                    <>
                      <select
                        value={filters.status || ''}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        className="input-field"
                      >
                        <option value="">All Status</option>
                        <option value="Planning">Planning</option>
                        <option value="Active">Active</option>
                        <option value="On Hold">On Hold</option>
                        <option value="Completed">Completed</option>
                      </select>
                      
                      <select
                        value={filters.priority || ''}
                        onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                        className="input-field"
                      >
                        <option value="">All Priority</option>
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Critical">Critical</option>
                      </select>
                    </>
                  )}
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={generateReport}
                className="btn-primary flex items-center"
              >
                <Download className="h-4 w-4 mr-2" />
                Generate Report
              </button>
            </div>
          </div>

          {/* Recent Reports */}
          <div className="card p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Reports</h3>
            <div className="text-center text-gray-500 py-8">
              <BarChart3 className="h-12 w-12 mx-auto text-gray-400 mb-2" />
              <p>No recent reports generated</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Reports