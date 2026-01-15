import { useEffect } from 'react';

/**
 * SEO Component for managing document title and meta tags.
 * @param {string} title - The page title (will be suffixed with " - EasyConvert").
 * @param {string} description - The meta description.
 * @param {string} keywords - Comma separated keywords.
 * @param {string} canonicalUrl - Canonical URL for the page.
 */
export function SEO({ title, description, keywords, canonicalUrl }) {
    useEffect(() => {
        // Update Title
        document.title = `${title} - EasyConvert`;

        // Helper to update meta tags
        const updateMeta = (name, content) => {
            let element = document.querySelector(`meta[name="${name}"]`);
            if (!element) {
                element = document.createElement('meta');
                element.name = name;
                document.head.appendChild(element);
            }
            element.content = content;
        };

        // Update Description
        if (description) {
            updateMeta('description', description);
        }

        // Update Keywords
        if (keywords) {
            updateMeta('keywords', keywords);
        }

        // Update Canonical
        let link = document.querySelector('link[rel="canonical"]');
        if (!link) {
            link = document.createElement('link');
            link.rel = 'canonical';
            document.head.appendChild(link);
        }
        link.href = canonicalUrl || window.location.href;

        // Cleanup function (optional, but good for SPA navigation)
        return () => {
            // We generally don't remove meta tags on unmount to avoid flickering, 
            // but the next page will overwrite them.
        };
    }, [title, description, keywords, canonicalUrl]);

    return null; // Headless component
}
