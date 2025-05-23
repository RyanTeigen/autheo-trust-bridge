
// Mock function to get the current user - would be from auth context in real app
export const getCurrentUser = (): string => {
  return 'Dr. Sarah Johnson'; // Example user
};

// Mock function to get the current IP address
export const getIpAddress = (): string => {
  return '192.168.1.100'; // In a real app, this would be obtained differently
};

// Generate a unique ID for each log entry
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Get browser and OS information
export const getBrowserInfo = (): { browser: string; os: string } => {
  // In a real app, this would use proper user-agent parsing
  return {
    browser: 'Chrome',
    os: 'Windows'
  };
};

// Get user's location (in a real app, this could be more precise)
export const getUserLocation = (): string => {
  return 'New York, NY'; // Example location
};
