import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';

/**
 * Simple API connection test component
 * Tests the connection between frontend and backend
 */
export const ApiTest: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'connected' | 'failed'>('testing');
  const [healthData, setHealthData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      setConnectionStatus('testing');
      setError(null);
      
      console.log('Testing API connection...');
      
      const response = await apiService.healthCheck();
      console.log('Health check response:', response);
      
      if (response.status === 'ok') {
        setConnectionStatus('connected');
        setHealthData(response);
      } else {
        throw new Error('Health check failed');
      }
    } catch (error: any) {
      console.error('API connection test failed:', error);
      setConnectionStatus('failed');
      setError(error.message || 'Connection failed');
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'testing': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'connected': return 'text-green-600 bg-green-50 border-green-200';
      case 'failed': return 'text-red-600 bg-red-50 border-red-200';
    }
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'testing': return 'sync';
      case 'connected': return 'check_circle';
      case 'failed': return 'error';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`p-4 rounded-lg border shadow-lg max-w-sm ${getStatusColor()}`}>
        <div className="flex items-center gap-3 mb-3">
          <span className={`material-symbols-outlined ${connectionStatus === 'testing' ? 'animate-spin' : ''}`}>
            {getStatusIcon()}
          </span>
          <div>
            <h3 className="font-bold text-sm">
              API Connection Status
            </h3>
            <p className="text-xs opacity-75">
              {connectionStatus === 'testing' && 'Testing connection...'}
              {connectionStatus === 'connected' && 'Connected to backend'}
              {connectionStatus === 'failed' && 'Connection failed'}
            </p>
          </div>
        </div>
        
        {error && (
          <div className="text-xs mb-3">
            <strong>Error:</strong> {error}
          </div>
        )}
        
        {healthData && (
          <div className="text-xs">
            <div><strong>Backend:</strong> {healthData.message}</div>
            <div><strong>Time:</strong> {new Date(healthData.timestamp).toLocaleTimeString()}</div>
            <div><strong>API URL:</strong> {apiService.getBaseURL()}</div>
          </div>
        )}
        
        {connectionStatus === 'failed' && (
          <button 
            onClick={testConnection}
            className="mt-2 text-xs px-3 py-1 bg-white border rounded hover:bg-gray-50 transition-colors"
          >
            Retry Connection
          </button>
        )}
      </div>
    </div>
  );
};

export default ApiTest;