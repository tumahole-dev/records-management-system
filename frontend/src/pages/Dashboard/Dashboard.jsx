import React from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Users, Building, FolderOpen, FileText, BarChart3, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'

const StatCard = ({ title, value, icon: Icon, color = 'blue', link }) => {
  const colors = {
    blue: 'text-blue-600 bg-blue-100',
    green: 'text-green-600 bg-green-100', 
    purple: 'text-purple-600 bg-purple-100',
    orange: 'text-orange-600 bg-orange-100'
  }

  const content = (
    <div className="card p-6 hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className={`p-3 rounded-lg ${colors[color]}`}>
            <Icon className="h-6 w-6" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
        </div>
      </div>
    </div>
  )

  return link ? <Link to={link}>{content}</Link> : content
}

const QuickAction = ({ title, description, icon: Icon, link, color = 'blue' }) => {
  const colors = {
    blue: 'text-blue-600 bg-blue-50 border-blue-200',
    green: 'text-green-600 bg-green-50 border-green-200',
    purple: 'text-purple-600 bg-purple-50 border-purple-200'
  }

  return (
    <Link 
      to={link} 
      className={`block p-4 rounded-lg border-2 ${colors[color]} hover:shadow-md transition-all duration-200 hover:scale-105`}
    >
      <div className="flex items-center">
        <Icon className="h-5 w-5 mr-3" />
        <div>
          <h4 className="font-semibold text-gray-900">{title}</h4>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        </div>
      </div>
    </Link>
  )
}

const Dashboard = () => {
  const { user } = useAuth()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">
            Welcome back, {user?.firstName} {user?.lastName}! 
            <span className="ml-2 text-sm text-gray-500 capitalize">({user?.role})</span>
          </p>
        </div>
        <div className="flex space-x-3">
          <Link
            to="/employees/new"
            className="btn-primary flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Employee
          </Link>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Employees"
          value="3"
          icon={Users}
          color="blue"
          link="/employees"
        />
        <StatCard
          title="Active Clients"
          value="1"
          icon={Building}
          color="green"
          link="/clients"
        />
        <StatCard
          title="Ongoing Projects"
          value="1"
          icon={FolderOpen}
          color="purple"
          link="/projects"
        />
        <StatCard
          title="Documents"
          value="0"
          icon={FileText}
          color="orange"
          link="/documents"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <QuickAction
                title="Manage Employees"
                description="View and manage employee records"
                icon={Users}
                link="/employees"
                color="blue"
              />
              <QuickAction
                title="Client Management"
                description="Handle client information and contracts"
                icon={Building}
                link="/clients"
                color="green"
              />
              <QuickAction
                title="Project Tracking"
                description="Monitor projects and milestones"
                icon={FolderOpen}
                link="/projects"
                color="purple"
              />
              <QuickAction
                titleGenerate Reports
                description="Create analytical reports"
                icon={BarChart3}
                link="/reports"
                color="blue"
              />
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-700">System initialized</span>
                </div>
                <span className="text-xs text-gray-500">Just now</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-700">Admin user logged in</span>
                </div>
                <span className="text-xs text-gray-500">Just now</span>
              </div>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Database</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Connected</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">API Server</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Online</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">File Storage</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Ready</span>
              </div>
            </div>
          </div>

          {/* Upcoming Tasks */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Getting Started</h3>
            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-600">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                Add your first employee
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                Create a client record
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                Start a new project
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard