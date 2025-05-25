
// API Configuration
// For GitHub Pages deployment, you can set these as repository secrets
// or use environment variables in your build process

export const API_CONFIG = {
  GNEWS_API_KEY: process.env.GNEWS_API_KEY || 'your-gnews-api-key-here',
  
  // You can get a free GNews API key at: https://gnews.io/
  // Add it to your environment or replace the placeholder above
};

// Helper function to check if APIs are configured
export const checkApiConfiguration = () => {
  const missingKeys = [];
  
  if (!API_CONFIG.GNEWS_API_KEY || API_CONFIG.GNEWS_API_KEY.includes('your-')) {
    missingKeys.push('GNEWS_API_KEY');
  }
  
  return {
    isConfigured: missingKeys.length === 0,
    missingKeys
  };
};
