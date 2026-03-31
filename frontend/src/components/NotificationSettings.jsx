import { useState } from 'react';
import { Bell, BellOff, Settings, Check, X, AlertTriangle } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';
import toast from 'react-hot-toast';

const NotificationSettings = () => {
  const { permission, requestPermission, fcmToken } = useNotification();
  const [isOpen, setIsOpen] = useState(false);

  const getPermissionIcon = () => {
    switch (permission) {
      case 'granted':
        return <Bell size={20} className="text-green-500" />;
      case 'denied':
        return <BellOff size={20} className="text-red-500" />;
      default:
        return <Bell size={20} className="text-gray-400" />;
    }
  };

  const getPermissionText = () => {
    switch (permission) {
      case 'granted':
        return 'Enabled';
      case 'denied':
        return 'Blocked';
      case 'default':
        return 'Not requested';
      default:
        return 'Unknown';
    }
  };

  const getPermissionColor = () => {
    switch (permission) {
      case 'granted':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'denied':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const handleEnableNotifications = async () => {
    const result = await requestPermission();
    if (result === 'granted') {
      setIsOpen(false);
    }
  };

  const handleTestNotification = () => {
    if (permission === 'granted') {
      new Notification('Test Notification', {
        body: 'This is a test notification from Blood Donation System!',
        icon: '/favicon.ico',
        tag: 'test-notification'
      });
      toast.success('Test notification sent!');
    } else {
      toast.error('Please enable notifications first');
    }
  };

  return (
    <div className="relative">
      {/* Settings Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all"
        title="Notification Settings"
      >
        <Settings size={20} />
      </button>

      {/* Settings Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                {getPermissionIcon()}
                <div>
                  <h3 className="font-bold text-gray-900">Notification Settings</h3>
                  <p className="text-xs text-gray-500">Manage your notification preferences</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-50 text-gray-400 hover:text-gray-600 transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Permission Status */}
              <div className={`p-4 rounded-xl border ${getPermissionColor()}`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold">Permission Status</span>
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-white bg-opacity-60">
                    {getPermissionText()}
                  </span>
                </div>
                
                {permission === 'granted' && (
                  <div className="flex items-center gap-2 text-sm">
                    <Check size={16} />
                    <span>Notifications are enabled and working</span>
                  </div>
                )}
                
                {permission === 'denied' && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <AlertTriangle size={16} />
                      <span>Notifications are blocked by browser</span>
                    </div>
                    <div className="text-xs bg-white bg-opacity-60 rounded-lg p-3">
                      <p className="font-semibold mb-2">To enable notifications:</p>
                      <ol className="space-y-1 list-decimal list-inside">
                        <li>Click the lock icon 🔒 in your address bar</li>
                        <li>Find "Notifications" in the menu</li>
                        <li>Change the setting to "Allow"</li>
                        <li>Refresh this page</li>
                      </ol>
                    </div>
                  </div>
                )}
                
                {permission === 'default' && (
                  <div className="text-sm">
                    <p>Notifications are not requested yet. Click the button below to enable them.</p>
                  </div>
                )}
              </div>

              {/* FCM Token Status */}
              {fcmToken && (
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-blue-900">Device Registered</span>
                    <Check size={16} className="text-blue-600" />
                  </div>
                  <p className="text-xs text-blue-700">
                    Your device is registered for push notifications
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                {permission !== 'granted' && (
                  <button
                    onClick={handleEnableNotifications}
                    className="w-full px-4 py-3 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition-colors"
                  >
                    {permission === 'denied' ? 'Try Again' : 'Enable Notifications'}
                  </button>
                )}
                
                {permission === 'granted' && (
                  <button
                    onClick={handleTestNotification}
                    className="w-full px-4 py-3 bg-blue-500 text-white font-semibold rounded-xl hover:bg-blue-600 transition-colors"
                  >
                    Send Test Notification
                  </button>
                )}
              </div>

              {/* Info */}
              <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
                <p className="font-semibold mb-1">Why notifications matter:</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Get instant alerts for blood requests</li>
                  <li>Receive booking confirmations</li>
                  <li>Know when reports are ready</li>
                  <li>Emergency blood donation alerts</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationSettings;
