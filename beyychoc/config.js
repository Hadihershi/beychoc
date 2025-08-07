// BeyChoc API Configuration
// Update this file based on your hosting setup

const API_CONFIG = {
    // For local development
    development: {
        baseURL: 'http://localhost/beyychoc/api',
        uploadURL: 'http://localhost/beyychoc/api/upload.php',
        productsURL: 'http://localhost/beyychoc/api/products.php'
    },
    
    // For 000webhost backend
    production: {
        baseURL: 'https://your-backend-domain.000webhostapp.com/api',
        uploadURL: 'https://your-backend-domain.000webhostapp.com/api/upload.php',
        productsURL: 'https://your-backend-domain.000webhostapp.com/api/products.php'
    },
    
    // For live website backend
    infinityfree: {
        baseURL: 'https://beychoc.wuaze.com/api',
        uploadURL: 'https://beychoc.wuaze.com/api/upload.php',
        productsURL: 'https://beychoc.wuaze.com/api/products.php'
    }
};

// Detect environment
const isLocalhost = window.location.hostname === 'localhost' || 
                   window.location.hostname === '127.0.0.1' ||
                   window.location.hostname.includes('localhost');

// Set current configuration
const currentConfig = isLocalhost ? API_CONFIG.development : API_CONFIG.infinityfree;

// Export configuration
window.API_CONFIG = currentConfig;

// Helper function to get API URL
function getApiUrl(endpoint) {
    return `${currentConfig.baseURL}/${endpoint}`;
}

// Helper function to get full URL
function getFullUrl(path) {
    return `${currentConfig.baseURL}/${path}`;
}

// Make functions globally available
window.getApiUrl = getApiUrl;
window.getFullUrl = getFullUrl; 