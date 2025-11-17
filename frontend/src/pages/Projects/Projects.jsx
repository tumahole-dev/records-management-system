import React, { useState } from 'react'
import { useQuery } from 'react-query'
import { Link } from 'react-router-dom'
import { Plus, Search, Filter, Calendar, Users, Target } from 'lucide-react'
import axios from 'axios'
import { format } from 'date-fns'

const Projects = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [page, setPage] = useState(1)

  const { data: projectsData, isLoading } = useQuery(
    ['projects', page, searchTerm, statusFilter, priorityFilter],
    async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      })
      
      if (searchTerm) params.append('search', searchTerm)
      if (statusFilter) params.append('status', statusFilter)
      if (priorityFilter) params.append('priority', priorityFilter)
      
      const response = await axios.get(`/api/projects?${params}`)
      return response.data
    }
  )

  const StatusBadge = ({ status }) => {
    const statusConfig = {
      Planning: { color: 'bg-blue-100 text-blue-800', label: 'Planning' },
      Active: { color: 'bg-green-100 text-green-800', label: 'Active' },
      'On Hold': { color: 'bg-yellow-100 text-yellow-800', label: 'On Hold' },
      Completed: { color: 'bg-gray-100 text-gray-800', label: 'Completed' },
      Cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelled' }
    }
    
    const config = statusConfig[status] || statusConfig.Planning
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    )
  }

  const PriorityBadge = ({ priority }) => {
    const priorityConfig = {
      Low: { color: 'bg-gray-100 text-gray-800', label: 'Low' },
      Medium: { color: 'bg-blue-100 text-blue-800', label: 'Medium' },
      High: { color: 'bg-orange-100 text-orange-800', label: 'High' },
      Critical: { color: 'bg-red-100 text-red-800', label: 'Critical' }
    }
    
    const config = priorityConfig[priority] || priorityConfig.Medium
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
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
        <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
        <Link
          to="/projects/new"
          className="btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="card p-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search projects..."
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
            <option value="Planning">Planning</option>
            <option value="Active">Active</option>
            <option value="On Hold">On Hold</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="input-field w-40"
          >
            <option value="">All Priority</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
        </div>
      </div>

      {/* Projects List */}
      <div className="space-y-4">
        {projectsData?.projects.map((project) => (
          <div key={project._id} className="card p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {project.title}
                  </h3>
                  <StatusBadge status={project.status} />
                  <PriorityBadge priority={project.priority} />
                </div>
                <p className="text-gray-600 mb-2">{project.description}</p>
                
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Target className="h-4 w-4 mr-1" />
                    {project.client.companyName}
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    {project.teamMembers.length} members
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {format(new Date(project.timeline.startDate), 'MMM dd, yyyy')} - {format(new Date(project.timeline.endDate), 'MMM dd, yyyy')}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-lg font-semibold text-gray-900">
                  ${project.budget.estimated.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">Budget</div>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                Manager: {project.manager.firstName} {project.manager.lastName}
              </div>
              <Link
                to={`/projects/${project._id}`}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                View Details →
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {projectsData && projectsData.totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn-secondary disabled:opacity-50"
          >
            Previous
          </button>
          
          <span className="text-sm text-gray-600">
            Page {page} of {projectsData.totalPages}
          </span>
          
          <button
            onClick={() => setPage(p => Math.min(projectsData.totalPages, p + 1))}
            disabled={page === projectsData.totalPages}
            className="btn-secondary disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

export default Projects