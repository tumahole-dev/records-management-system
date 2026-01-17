import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { Link } from 'react-router-dom'
import { Plus, Search, Filter, Mail, Phone, MapPin, Edit, Trash2 } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

const API_BASE_URL = import.meta.env.VITE_API_URL || ''

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

const Employees = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  
  const queryClient = useQueryClient()

  // Fetch employees
  const { data: employeesData, isLoading } = useQuery(
    ['employees', page, searchTerm, departmentFilter, statusFilter],
    async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      })
      
      if (searchTerm) params.append('search', searchTerm)
      if (departmentFilter) params.append('department', departmentFilter)
      if (statusFilter) params.append('status', statusFilter)
      
      const response = await axios.get(
        `${API_BASE_URL}/api/employees?${params}`,
        getAuthHeaders()
      )
      return response.data
    }
  )

  // Delete employee mutation
  const deleteMutation = useMutation(
    (id) => axios.delete(`${API_BASE_URL}/api/employees/${id}`, getAuthHeaders()),
    {
      onSuccess: () => {
        toast.success('Employee deleted successfully')
        queryClient.invalidateQueries('employees')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to delete employee')
      }
    }
  )

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
  }

  const StatusBadge = ({ status }) => {
    const statusColors = {
      Active: 'bg-green-100 text-green-800',
      'On Leave': 'bg-yellow-100 text-yellow-800',
      Terminated: 'bg-red-100 text-red-800',
      Resigned: 'bg-gray-100 text-gray-800'
    }
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    )
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
        <Link
          to="/employees/new"
          className="btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Employee
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="card p-4">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search employees by name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="input-field w-full md:w-40"
            >
              <option value="">All Departments</option>
              <option value="IT">IT</option>
              <option value="HR">HR</option>
              <option value="Finance">Finance</option>
              <option value="Marketing">Marketing</option>
              <option value="Operations">Operations</option>
            </select>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field w-full md:w-40"
            >
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="On Leave">On Leave</option>
              <option value="Terminated">Terminated</option>
            </select>
            
            <button type="submit" className="btn-primary flex items-center">
              <Filter className="h-4 w-4 mr-2" />
              Apply Filters
            </button>
          </div>
        </form>
      </div>

      {/* Employees Grid/List */}
      {employeesData?.employees && employeesData.employees.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {employeesData.employees.map((employee) => (
              <div key={employee._id} className="card p-6 hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {employee.personalDetails?.firstName} {employee.personalDetails?.lastName}
                    </h3>
                    <p className="text-sm text-gray-600">{employee.employeeId}</p>
                  </div>
                  <StatusBadge status={employee.status} />
                </div>

                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  {employee.user?.email && (
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{employee.user.email}</span>
                    </div>
                  )}
                  {employee.personalDetails?.contactNumber && (
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                      {employee.personalDetails.contactNumber}
                    </div>
                  )}
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>
                      {employee.jobDetails?.department} • {employee.jobDetails?.position}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    {employee.jobDetails?.hireDate ? 
                      `Since ${new Date(employee.jobDetails.hireDate).getFullYear()}` : 
                      'Hire date not set'
                    }
                  </span>
                  <div className="flex space-x-2">
                    <Link
                      to={`/employees/${employee._id}`}
                      className="text-blue-600 hover:text-blue-700 p-1"
                      title="View Details"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this employee?')) {
                          deleteMutation.mutate(employee._id)
                        }
                      }}
                      className="text-red-600 hover:text-red-700 p-1"
                      title="Delete Employee"
                      disabled={deleteMutation.isLoading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {employeesData.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
              <div className="text-sm text-gray-600">
                Showing {(page - 1) * 10 + 1} to {Math.min(page * 10, employeesData.total)} of {employeesData.total} employees
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                
                <div className="flex space-x-1">
                  {Array.from({ length: Math.min(5, employeesData.totalPages) }, (_, i) => {
                    let pageNum;
                    if (employeesData.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= employeesData.totalPages - 2) {
                      pageNum = employeesData.totalPages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`w-8 h-8 rounded-md text-sm ${
                          page === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => setPage(p => Math.min(employeesData.totalPages, p + 1))}
                  disabled={page === employeesData.totalPages}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="card p-12 text-center">
          <div className="mx-auto w-12 h-12 text-gray-400 mb-4">
            <Search className="w-full h-full" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No employees found</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || departmentFilter || statusFilter
              ? 'Try adjusting your search or filters'
              : 'Get started by adding your first employee'}
          </p>
          <Link
            to="/employees/new"
            className="btn-primary inline-flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add First Employee
          </Link>
        </div>
      )}
    </div>
  )
}

export default Employees