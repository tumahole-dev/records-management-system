import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { Link } from 'react-router-dom'
import { Plus, Search, Filter, Building, Phone, Mail } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

const Clients = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  
  const queryClient = useQueryClient()

  const { data: clientsData, isLoading } = useQuery(
    ['clients', page, searchTerm, statusFilter],
    async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      })
      
      if (searchTerm) params.append('search', searchTerm)
      if (statusFilter) params.append('status', statusFilter)
      
      const response = await axios.get(`/api/clients?${params}`)
      return response.data
    }
  )

  const deleteMutation = useMutation(
    (id) => axios.delete(`/api/clients/${id}`),
    {
      onSuccess: () => {
        toast.success('Client deleted successfully')
        queryClient.invalidateQueries('clients')
      },
      onError: () => {
        toast.error('Failed to delete client')
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
      Inactive: 'bg-gray-100 text-gray-800',
      Suspended: 'bg-red-100 text-red-800'
    }
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}>
        {status}
      </span>
    )
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
        <Link
          to="/clients/new"
          className="btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Client
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="card p-4">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field w-40"
          >
            <option value="">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Suspended">Suspended</option>
          </select>
          
          <button type="submit" className="btn-primary">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </button>
        </form>
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clientsData?.clients.map((client) => (
          <div key={client._id} className="card p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {client.companyName}
                </h3>
                <p className="text-sm text-gray-600">
                  {client.contactPerson.firstName} {client.contactPerson.lastName}
                </p>
              </div>
              <StatusBadge status={client.status} />
            </div>

            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2" />
                {client.contactDetails.email}
              </div>
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2" />
                {client.contactDetails.phone}
              </div>
              <div className="flex items-center">
                <Building className="h-4 w-4 mr-2" />
                {client.businessDetails?.industry || 'N/A'}
              </div>
            </div>

            <div className="mt-4 flex justify-between items-center">
              <span className="text-sm text-gray-500">
                {client.projects?.length || 0} projects
              </span>
              <div className="flex space-x-2">
                <Link
                  to={`/clients/${client._id}`}
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  View
                </Link>
                <button
                  onClick={() => deleteMutation.mutate(client._id)}
                  className="text-red-600 hover:text-red-700 text-sm font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {clientsData && clientsData.totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn-secondary disabled:opacity-50"
          >
            Previous
          </button>
          
          <span className="text-sm text-gray-600">
            Page {page} of {clientsData.totalPages}
          </span>
          
          <button
            onClick={() => setPage(p => Math.min(clientsData.totalPages, p + 1))}
            disabled={page === clientsData.totalPages}
            className="btn-secondary disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

export default Clients