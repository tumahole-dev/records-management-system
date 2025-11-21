import React from 'react'
import { useAuth } from '../../contexts/AuthContext'

const Dashboard = () => {
  const { user } = useAuth()

  console.log('📊 Dashboard - User object:', user)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">
            Welcome back, {user?.firstName} {user?.lastName}! 
            <span className="ml-2 text-sm text-gray-500 capitalize">({user?.role})</span>
          </p>
          
          {/* Debug info - remove after fixing */}
          <div className="mt-2 p-2 bg-yellow-100 border border-yellow-400 rounded">
            <p className="text-xs text-yellow-800">
              <strong>Debug Info:</strong><br/>
              User exists: {user ? 'Yes' : 'No'}<br/>
              First Name: {user?.firstName || 'Not found'}<br/>
              Last Name: {user?.lastName || 'Not found'}<br/>
              Role: {user?.role || 'Not found'}
            </p>
          </div>
        </div>
      </div>
      
      {/* Rest of your dashboard content */}
    </div>
  )
}

export default Dashboard