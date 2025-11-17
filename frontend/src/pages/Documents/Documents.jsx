import React, { useState } from 'react'
import { useQuery } from 'react-query'
import { Link } from 'react-router-dom'
import { Plus, Search, Filter, FileText, Download, Eye } from 'lucide-react'
import axios from 'axios'
import { format } from 'date-fns'

const Documents = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [modelTypeFilter, setModelTypeFilter] = useState('')
  const [page, setPage] = useState(1)

  const { data: documentsData, isLoading } = useQuery(
    ['documents', page, searchTerm, categoryFilter, modelTypeFilter],
    async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      })
      
      if (searchTerm) params.append('search', searchTerm)
      if (categoryFilter) params.append('category', categoryFilter)
      if (modelTypeFilter) params.append('modelType', modelTypeFilter)
      
      const response = await axios.get(`/api/documents?${params}`)
      return response.data
    }
  )

  const getFileIcon = (fileType) => {
    const icons = {
      '.pdf': '📄',
      '.doc': '📝',
      '.docx': '📝',
      '.xls': '📊',
      '.xlsx': '📊',
      '.jpg': '🖼️',
      '.png': '🖼️',
      '.txt': '📄'
    }
    
    return icons[fileType] || '📄'
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
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
        <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
        <Link
          to="/documents/upload"
          className="btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Upload Document
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
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>
          
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="input-field w-40"
          >
            <option value="">All Categories</option>
            <option value="Employee">Employee</option>
            <option value="Client">Client</option>
            <option value="Project">Project</option>
            <option value="Contract">Contract</option>
            <option value="Financial">Financial</option>
            <option value="Other">Other</option>
          </select>
          
          <select
            value={modelTypeFilter}
            onChange={(e) => setModelTypeFilter(e.target.value)}
            className="input-field w-40"
          >
            <option value="">All Types</option>
            <option value="Employee">Employee</option>
            <option value="Client">Client</option>
            <option value="Project">Project</option>
            <option value="User">User</option>
          </select>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {documentsData?.documents.map((document) => (
          <div key={document._id} className="card p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{getFileIcon(document.fileType)}</span>
                <div>
                  <h3 className="font-semibold text-gray-900 line-clamp-2">
                    {document.title}
                  </h3>
                  <p className="text-sm text-gray-500">{document.fileName}</p>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-sm text-gray-600 mb-4">
              <div className="flex justify-between">
                <span>Category:</span>
                <span className="font-medium">{document.category}</span>
              </div>
              <div className="flex justify-between">
                <span>Size:</span>
                <span>{formatFileSize(document.fileSize)}</span>
              </div>
              <div className="flex justify-between">
                <span>Uploaded:</span>
                <span>{format(new Date(document.createdAt), 'MMM dd, yyyy')}</span>
              </div>
              <div className="flex justify-between">
                <span>By:</span>
                <span>{document.uploadedBy.firstName} {document.uploadedBy.lastName}</span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">
                Version {document.version.current}
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => window.open(document.fileUrl, '_blank')}
                  className="text-primary-600 hover:text-primary-700 p-1"
                  title="View"
                >
                  <Eye className="h-4 w-4" />
                </button>
                <a
                  href={document.fileUrl}
                  download
                  className="text-gray-600 hover:text-gray-700 p-1"
                  title="Download"
                >
                  <Download className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {documentsData && documentsData.totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn-secondary disabled:opacity-50"
          >
            Previous
          </button>
          
          <span className="text-sm text-gray-600">
            Page {page} of {documentsData.totalPages}
          </span>
          
          <button
            onClick={() => setPage(p => Math.min(documentsData.totalPages, p + 1))}
            disabled={page === documentsData.totalPages}
            className="btn-secondary disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

export default Documents