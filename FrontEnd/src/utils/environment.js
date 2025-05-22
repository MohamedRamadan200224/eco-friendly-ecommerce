// Determine if we're in development mode
export const isDevelopment = () => {
  // Check if we're running in development mode
  // This can be set in your .env file or determined by the build process
  return import.meta.env.MODE === 'development' || 
         import.meta.env.DEV === true ||
         window.location.hostname === 'localhost';
};