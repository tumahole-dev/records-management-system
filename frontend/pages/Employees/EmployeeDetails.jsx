import React from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from 'react-query'
import { ArrowLeft, Mail, Phone, Calendar, MapPin, Edit, Trash2 } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

const API_BASE_URL = import.meta.env.VITE_API_URL || ''

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

const EmployeeDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data: employee, isLoading } = useQuery(
    ['employee', id],
    async () => {
      const response = await axios.get(
        `${API_BASE_URL}/api/employees/${id}`,
        getAuthHeaders()
      )
      return response.data
    }
  )

  const deleteMutation = useMutation(
    () => axios.delete(`${API_BASE_URL}/api/employees/${id}`, getAuthHeaders()),
    {
      onSuccess: () => {
        toast.success('Employee deleted successfully')
        navigate('/employees')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to delete employee')
      }
    }
  )

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!employee) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900">Employee not found</h2>
        <Link to="/employees" className="text-blue-600 hover:text-blue-700 mt-2 inline-block">
          Back to Employees
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/employees"
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Employee Details</h1>
        </div>
        <div className="flex space-x-2">
          <Link
            to={`/employees/${id}/edit`}
            className="btn-primary flex items-center"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Link>
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this employee?')) {
                deleteMutation.mutate()
              }
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center disabled:opacity-50"
            disabled={deleteMutation.isLoading}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {deleteMutation.isLoading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Personal Information */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">First Name</label>
                <p className="mt-1 text-sm text-gray-900">{employee.personalDetails?.firstName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                <p className="mt-1 text-sm text-gray-900">{employee.personalDetails?.lastName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                <p className="mt-1 text-sm text-gray-900 flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  {employee.personalDetails?.dateOfBirth ? 
                    new Date(employee.personalDetails.dateOfBirth).toLocaleDateString() : 
                    'Not set'
                  }
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Gender</label>
                <p className="mt-1 text-sm text-gray-900">{employee.personalDetails?.gender || 'Not set'}</p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Personal Email</label>
                <p className="mt-1 text-sm text-gray-900 flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  {employee.personalDetails?.personalEmail || 'Not set'}
                </p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Contact Number</label>
                <p className="mt-1 text-sm text-gray-900 flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  {employee.personalDetails?.contactNumber || 'Not set'}
                </p>
              </div>
            </div>
          </div>

          {/* Job Information */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Job Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Employee ID</label>
                <p className="mt-1 text-sm text-gray-900">{employee.employeeId}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Department</label>
                <p className="mt-1 text-sm text-gray-900">{employee.jobDetails?.department}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Position</label>
                <p className="mt-1 text-sm text-gray-900">{employee.jobDetails?.position}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Employment Type</label>
                <p className="mt-1 text-sm text-gray-900">{employee.jobDetails?.employmentType}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Hire Date</label>
                <p className="mt-1 text-sm text-gray-900 flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  {employee.jobDetails?.hireDate ? 
                    new Date(employee.jobDetails.hireDate).toLocaleDateString() : 
                    'Not set'
                  }
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Salary</label>
                <p className="mt-1 text-sm text-gray-900">
                  {employee.jobDetails?.salary ? 
                    `$${employee.jobDetails.salary.toLocaleString()}` : 
                    'Not set'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Card */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Status</h3>
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              employee.status === 'Active' 
                ? 'bg-green-100 text-green-800'
                : employee.status === 'On Leave'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {employee.status}
            </div>
          </div>

          {/* Contact Card */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact</h3>
            <div className="space-y-3">
              {employee.user?.email && (
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="truncate">{employee.user.email}</span>
                </div>
              )}
              {employee.personalDetails?.contactNumber && (
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="h-4 w-4 mr-2" />
                  {employee.personalDetails.contactNumber}
                </div>
              )}
              {employee.personalDetails?.address && (
                <div className="flex items-start text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    {employee.personalDetails.address.street && (
                      <div>{employee.personalDetails.address.street}</div>
                    )}
                    {employee.personalDetails.address.city && (
                      <div>{employee.personalDetails.address.city}, {employee.personalDetails.address.state}</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmployeeDetails