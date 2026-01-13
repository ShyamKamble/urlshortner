import { ExternalLink } from 'lucide-react';
import { decodeUrl, extractDomain, formatUrlForDisplay, getFaviconUrl } from '../../utils/urlUtils';

/**
 * URL Display Component - Shows URLs in a clean, readable format
 * @param {string} url - The URL to display
 * @param {boolean} showFavicon - Whether to show favicon (default: true)
 * @param {boolean} domainOnly - Show only domain name (default: false)
 * @param {number} maxLength - Maximum length for URL display (default: 40)
 * @param {string} className - Additional CSS classes
 */
export function UrlDisplay({ 
  url, 
  showFavicon = true, 
  domainOnly = false, 
  maxLength = 40, 
  className = "",
  showExternalIcon = false 
}) {
  if (!url) return null;

  const decodedUrl = decodeUrl(url);
  const domain = extractDomain(url);
  const faviconUrl = getFaviconUrl(url);
  const displayText = domainOnly ? domain : formatUrlForDisplay(decodedUrl, maxLength);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showFavicon && faviconUrl && (
        <img 
          src={faviconUrl} 
          alt="" 
          className="w-4 h-4 flex-shrink-0"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      )}
      <a
        href={decodedUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:text-blue-800 underline underline-offset-2 truncate flex items-center gap-1"
        title={decodedUrl}
      >
        {displayText}
        {showExternalIcon && <ExternalLink className="w-3 h-3 flex-shrink-0" />}
      </a>
    </div>
  );
}

/**
 * Compact URL Display - Shows domain prominently with full URL as subtitle
 */
export function CompactUrlDisplay({ url, className = "" }) {
  if (!url) return null;

  const decodedUrl = decodeUrl(url);
  const domain = extractDomain(url);
  const faviconUrl = getFaviconUrl(url);

  return (
    <div className={`flex items-center gap-2 max-w-xs ${className}`}>
      {faviconUrl && (
        <img 
          src={faviconUrl} 
          alt="" 
          className="w-4 h-4 flex-shrink-0"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      )}
      <div className="flex flex-col min-w-0">
        <a
          href={decodedUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 underline underline-offset-2 truncate font-medium"
          title={decodedUrl}
        >
          {domain}
        </a>
        <span className="text-xs text-gray-500 truncate" title={decodedUrl}>
          {formatUrlForDisplay(decodedUrl, 35)}
        </span>
      </div>
    </div>
  );
}