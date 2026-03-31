import { useState, useEffect } from 'react';
import { Button } from './Common/Button';
import { getNotifications } from '../api/api';
import toast from 'react-hot-toast';

const NotificationDebug = () => {
  const [debugInfo, setDebugInfo] = useState({});
  const [loading, setLoading] = useState(false);

  const testAPI = async () => {
    setLoading(true);
    try {
      console.log('Testing notifications API...');
      const response = await getNotifications({ limit: 5 });
      console.log('API Response:', response);
      
      setDebugInfo({
        response: response,
        notificationsCount: response.notifications?.length || 0,
        unreadCount: response.unreadCount || 0,
        timestamp: new Date().toISOString()
      });
      
      toast.success('API test successful');
    } catch (error) {
      console.error('API Test Error:', error);
      setDebugInfo({
        error: error.message,
        timestamp: new Date().toISOString()
      });
      toast.error('API test failed');
    } finally {
      setLoading(false);
    }
  };

  const testEvent = () => {
    console.log('Testing custom event...');
    const testPayload = {
      notification: {
        title: 'Test Notification',
        body: 'This is a test notification'
      },
      data: {
        type: 'test',
        timestamp: Date.now()
      }
    };
    
    window.dispatchEvent(new CustomEvent('newNotification', { detail: testPayload }));
    toast.success('Event dispatched');
  };

  const clearDebug = () => {
    setDebugInfo({});
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50 max-w-sm">
      <h4 className="font-bold text-gray-900 mb-3">Notification Debug</h4>
      
      <div className="space-y-2 mb-3">
        <Button onClick={testAPI} disabled={loading} size="sm">
          {loading ? 'Testing...' : 'Test API'}
        </Button>
        
        <Button onClick={testEvent} size="sm" variant="outline">
          Test Event
        </Button>
        
        <Button onClick={clearDebug} size="sm" variant="ghost">
          Clear
        </Button>
      </div>

      {debugInfo.response && (
        <div className="text-xs space-y-1 border-t pt-2">
          <div><strong>Notifications:</strong> {debugInfo.notificationsCount}</div>
          <div><strong>Unread:</strong> {debugInfo.unreadCount}</div>
          <div><strong>Time:</strong> {new Date(debugInfo.timestamp).toLocaleTimeString()}</div>
        </div>
      )}

      {debugInfo.error && (
        <div className="text-xs text-red-600 border-t pt-2">
          <div><strong>Error:</strong> {debugInfo.error}</div>
          <div><strong>Time:</strong> {new Date(debugInfo.timestamp).toLocaleTimeString()}</div>
        </div>
      )}
    </div>
  );
};

export default NotificationDebug;
