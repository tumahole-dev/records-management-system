import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import axios from 'axios'
import toast from 'react-hot-toast'
import { ArrowLeft, Save } from 'lucide-react'

const API_BASE_URL = import.meta.env.VITE_API_URL || ''

const AddEmployee = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(
        `${API_BASE_URL}/api/employees`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      
      toast.success('Employee added successfully!')
      navigate('/employees')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add employee')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/employees')}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Add New Employee</h1>
        </div>
      </div>

      {/* Form */}
      <div className="card p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  {...register('personalDetails.firstName', { required: 'First name is required' })}
                  className="input-field"
                  placeholder="John"
                />
                {errors.personalDetails?.firstName && (
                  <p className="mt-1 text-sm text-red-600">{errors.personalDetails.firstName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  {...register('personalDetails.lastName', { required: 'Last name is required' })}
                  className="input-field"
                  placeholder="Doe"
                />
                {errors.personalDetails?.lastName && (
                  <p className="mt-1 text-sm text-red-600">{errors.personalDetails.lastName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth *
                </label>
                <input
                  type="date"
                  {...register('personalDetails.dateOfBirth', { required: 'Date of birth is required' })}
                  className="input-field"
                />
                {errors.personalDetails?.dateOfBirth && (
                  <p className="mt-1 text-sm text-red-600">{errors.personalDetails.dateOfBirth.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender *
                </label>
                <select
                  {...register('personalDetails.gender', { required: 'Gender is required' })}
                  className="input-field"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                {errors.personalDetails?.gender && (
                  <p className="mt-1 text-sm text-red-600">{errors.personalDetails.gender.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Number *
                </label>
                <input
                  type="tel"
                  {...register('personalDetails.contactNumber', { required: 'Contact number is required' })}
                  className="input-field"
                  placeholder="+1234567890"
                />
                {errors.personalDetails?.contactNumber && (
                  <p className="mt-1 text-sm text-red-600">{errors.personalDetails.contactNumber.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Personal Email *
                </label>
                <input
                  type="email"
                  {...register('personalDetails.personalEmail', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  className="input-field"
                  placeholder="john.doe@example.com"
                />
                {errors.personalDetails?.personalEmail && (
                  <p className="mt-1 text-sm text-red-600">{errors.personalDetails.personalEmail.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Job Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department *
                </label>
                <select
                  {...register('jobDetails.department', { required: 'Department is required' })}
                  className="input-field"
                >
                  <option value="">Select Department</option>
                  <option value="IT">IT</option>
                  <option value="HR">HR</option>
                  <option value="Finance">Finance</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Operations">Operations</option>
                  <option value="Sales">Sales</option>
                </select>
                {errors.jobDetails?.department && (
                  <p className="mt-1 text-sm text-red-600">{errors.jobDetails.department.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Position *
                </label>
                <input
                  type="text"
                  {...register('jobDetails.position', { required: 'Position is required' })}
                  className="input-field"
                  placeholder="Software Developer"
                />
                {errors.jobDetails?.position && (
                  <p className="mt-1 text-sm text-red-600">{errors.jobDetails.position.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hire Date *
                </label>
                <input
                  type="date"
                  {...register('jobDetails.hireDate', { required: 'Hire date is required' })}
                  className="input-field"
                />
                {errors.jobDetails?.hireDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.jobDetails.hireDate.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employment Type *
                </label>
                <select
                  {...register('jobDetails.employmentType', { required: 'Employment type is required' })}
                  className="input-field"
                >
                  <option value="">Select Type</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Temporary">Temporary</option>
                </select>
                {errors.jobDetails?.employmentType && (
                  <p className="mt-1 text-sm text-red-600">{errors.jobDetails.employmentType.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Salary *
                </label>
                <input
                  type="number"
                  {...register('jobDetails.salary', { 
                    required: 'Salary is required',
                    min: { value: 0, message: 'Salary must be positive' }
                  })}
                  className="input-field"
                  placeholder="50000"
                />
                {errors.jobDetails?.salary && (
                  <p className="mt-1 text-sm text-red-600">{errors.jobDetails.salary.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Work Location
                </label>
                <input
                  type="text"
                  {...register('jobDetails.workLocation')}
                  className="input-field"
                  placeholder="Office/Remote"
                />
              </div>
            </div>
          </div>

          {/* Status */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employee Status *
                </label>
                <select
                  {...register('status', { required: 'Status is required' })}
                  className="input-field"
                  defaultValue="Active"
                >
                  <option value="Active">Active</option>
                  <option value="On Leave">On Leave</option>
                  <option value="Terminated">Terminated</option>
                  <option value="Resigned">Resigned</option>
                </select>
                {errors.status && (
                  <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={() => navigate('/employees')}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center disabled:opacity-50"
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Saving...' : 'Save Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddEmployee