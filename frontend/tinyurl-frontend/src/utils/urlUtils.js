// URL utility functions for better display and handling

/**
 * Decode HTML entities and URL encoding from a URL string
 * @param {string} url - The encoded URL
 * @returns {string} - Clean decoded URL
 */
export const decodeUrl = (url) => {
  if (!url || typeof url !== 'string') return url;
  
  try {
    // First decode HTML entities
    let decoded = url
      .replace(/&#x2F;/g, '/')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#x27;/g, "'");
    
    // Then decode URL encoding
    decoded = decodeURIComponent(decoded);
    
    // Fix double protocol issue
    if (decoded.startsWith('https://https://') || decoded.startsWith('http://https://')) {
      decoded = decoded.replace(/^https?:\/\//, '');
    }
    if (decoded.startsWith('https://http://') || decoded.startsWith('http://http://')) {
      decoded = decoded.replace(/^https?:\/\//, '');
    }
    
    return decoded;
  } catch (error) {
    console.warn('Failed to decode URL:', url, error);
    return url;
  }
};

/**
 * Extract domain from URL for display
 * @param {string} url - The full URL
 * @returns {string} - Just the domain (e.g., "youtube.com")
 */
export const extractDomain = (url) => {
  if (!url || typeof url !== 'string') return url;
  
  try {
    // First decode the URL
    const decodedUrl = decodeUrl(url);
    
    // Create URL object to extract hostname
    const urlObj = new URL(decodedUrl);
    let hostname = urlObj.hostname;
    
    // Remove 'www.' prefix for cleaner display
    if (hostname.startsWith('www.')) {
      hostname = hostname.substring(4);
    }
    
    return hostname;
  } catch (error) {
    // If URL parsing fails, try to extract domain manually
    try {
      const decodedUrl = decodeUrl(url);
      const match = decodedUrl.match(/^https?:\/\/(?:www\.)?([^\/]+)/);
      return match ? match[1] : url;
    } catch (fallbackError) {
      console.warn('Failed to extract domain from URL:', url, fallbackError);
      return url;
    }
  }
};

/**
 * Format URL for display with truncation
 * @param {string} url - The full URL
 * @param {number} maxLength - Maximum length for display (default: 50)
 * @param {boolean} domainOnly - Show only domain (default: false)
 * @returns {string} - Formatted URL for display
 */
export const formatUrlForDisplay = (url, maxLength = 50, domainOnly = false) => {
  if (!url || typeof url !== 'string') return url;
  
  try {
    if (domainOnly) {
      return extractDomain(url);
    }
    
    const decodedUrl = decodeUrl(url);
    
    if (decodedUrl.length <= maxLength) {
      return decodedUrl;
    }
    
    // Truncate with ellipsis
    return decodedUrl.substring(0, maxLength - 3) + '...';
  } catch (error) {
    console.warn('Failed to format URL for display:', url, error);
    return url.length > maxLength ? url.substring(0, maxLength - 3) + '...' : url;
  }
};

/**
 * Validate if a URL is properly formatted
 * @param {string} url - The URL to validate
 * @returns {boolean} - True if valid URL
 */
export const isValidUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  
  try {
    const decodedUrl = decodeUrl(url);
    new URL(decodedUrl);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Get favicon URL for a domain
 * @param {string} url - The full URL
 * @returns {string} - Favicon URL
 */
export const getFaviconUrl = (url) => {
  try {
    const domain = extractDomain(url);
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=16`;
  } catch (error) {
    return null;
  }
};