import { useState } from 'react';
import { X, Globe, ExternalLink } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

const NotificationGuide = ({ onClose }) => {
  const { permission } = useNotification();
  const [browser, setBrowser] = useState('chrome');

  // Detect browser
  useState(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes('chrome')) setBrowser('chrome');
    else if (userAgent.includes('firefox')) setBrowser('firefox');
    else if (userAgent.includes('safari')) setBrowser('safari');
    else setBrowser('chrome'); // default
  });

  const getBrowserIcon = () => {
    return <Globe size={24} className="text-blue-500" />;
  };

  const getSteps = () => {
    switch (browser) {
      case 'chrome':
        return [
          'Click the lock icon 🔒 in the address bar',
          'Find "Notifications" in the dropdown menu',
          'Change the setting from "Blocked" to "Allow"',
          'Refresh the page to apply changes'
        ];
      case 'firefox':
        return [
          'Click the lock icon 🔒 in the address bar',
          'Click the arrow next to "Notifications"',
          'Select "Allow" from the dropdown menu',
          'Refresh the page to apply changes'
        ];
      case 'safari':
        return [
          'Click Safari in the menu bar',
          'Select Preferences > Websites',
          'Find Notifications in the left sidebar',
          'Set blood-6bb33.firebaseapp.com to "Allow"'
        ];
      default:
        return [
          'Look for a lock icon 🔒 in your address bar',
          'Find site settings or permissions',
          'Locate notification settings',
          'Change to "Allow" and refresh'
        ];
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            {getBrowserIcon()}
            <div>
              <h3 className="font-bold text-gray-900">Enable Notifications</h3>
              <p className="text-sm text-gray-500">Follow these steps to enable notifications</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-50 text-gray-400 hover:text-gray-600 transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Current Status */}
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center gap-2 text-red-700">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="font-semibold">Notifications are currently blocked</span>
            </div>
            <p className="text-sm text-red-600 mt-2">
              You need to enable notifications to receive real-time updates for blood requests and donations.
            </p>
          </div>

          {/* Steps */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 mb-4">How to enable notifications:</h4>
            <div className="space-y-3">
              {getSteps().map((step, index) => (
                <div key={index} className="flex gap-3">
                  <div className="flex-shrink-0 w-7 h-7 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <p className="text-sm text-gray-700 flex-1">{step}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Why Important */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <h4 className="font-semibold text-blue-900 mb-2">Why notifications matter:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Get instant alerts for emergency blood requests</li>
              <li>• Receive booking confirmations</li>
              <li>• Know when reports are ready</li>
              <li>• Save lives with timely responses</li>
            </ul>
          </div>

          {/* Action Button */}
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition-colors"
          >
            I've Enabled Notifications
          </button>

          {/* Help Link */}
          <div className="mt-4 text-center">
            <a
              href="https://support.google.com/chrome/answer/3220246"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
            >
              <ExternalLink size={14} />
              Need more help?
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationGuide;
