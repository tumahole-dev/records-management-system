import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from 'react-query'
import { ArrowLeft, Mail, Phone, Calendar, MapPin } from 'lucide-react'
import axios from 'axios'

const EmployeeDetails = () => {
  const { id } = useParams()

  const { data: employee, isLoading } = useQuery(
    ['employee', id],
    async () => {
      const response = await axios.get(`/api/employees/${id}`)
      return response.data
    }
  )

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!employee) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900">Employee not found</h2>
        <Link to="/employees" className="text-primary-600 hover:text-primary-700">
          Back to Employees
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link
          to="/employees"
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Employee Details</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Personal Information */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">First Name</label>
                <p className="mt-1 text-sm text-gray-900">{employee.personalDetails.firstName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                <p className="mt-1 text-sm text-gray-900">{employee.personalDetails.lastName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(employee.personalDetails.dateOfBirth).toLocaleDateString()}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Gender</label>
                <p className="mt-1 text-sm text-gray-900">{employee.personalDetails.gender}</p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Personal Email</label>
                <p className="mt-1 text-sm text-gray-900 flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  {employee.personalDetails.personalEmail}
                </p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Contact Number</label>
                <p className="mt-1 text-sm text-gray-900 flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  {employee.personalDetails.contactNumber}
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
                <p className="mt-1 text-sm text-gray-900">{employee.jobDetails.department}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Position</label>
                <p className="mt-1 text-sm text-gray-900">{employee.jobDetails.position}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Employment Type</label>
                <p className="mt-1 text-sm text-gray-900">{employee.jobDetails.employmentType}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Hire Date</label>
                <p className="mt-1 text-sm text-gray-900 flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  {new Date(employee.jobDetails.hireDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Salary</label>
                <p className="mt-1 text-sm text-gray-900">
                  ${employee.jobDetails.salary?.toLocaleString()}
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
              <div className="flex items-center text-sm text-gray-600">
                <Mail className="h-4 w-4 mr-2" />
                {employee.user?.email}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="h-4 w-4 mr-2" />
                {employee.personalDetails.contactNumber}
              </div>
              {employee.personalDetails.address && (
                <div className="flex items-start text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-2 mt-0.5" />
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