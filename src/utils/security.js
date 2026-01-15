/**
 * Security Utilities for Frontend-Only SaaS
 * No backend, no login, no file storage
 * All processing happens locally in the browser
 */

// ================================
// 1️⃣ INPUT SANITIZATION
// ================================

/**
 * Sanitize user text input to prevent XSS
 * Escapes HTML entities
 */
export function sanitizeText(input) {
    if (typeof input !== 'string') return '';

    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
}

/**
 * Sanitize object recursively (for JSON data)
 */
export function sanitizeObject(obj) {
    if (typeof obj === 'string') {
        return sanitizeText(obj);
    }

    if (Array.isArray(obj)) {
        return obj.map(item => sanitizeObject(item));
    }

    if (obj && typeof obj === 'object') {
        const sanitized = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                sanitized[sanitizeText(key)] = sanitizeObject(obj[key]);
            }
        }
        return sanitized;
    }

    return obj;
}

/**
 * Strip all HTML tags from input
 */
export function stripHtml(input) {
    if (typeof input !== 'string') return '';
    return input.replace(/<[^>]*>/g, '');
}

/**
 * Validate and sanitize URL
 */
export function sanitizeUrl(url) {
    if (typeof url !== 'string') return '';

    // Only allow http and https protocols
    const allowedProtocols = ['http:', 'https:'];

    try {
        const parsed = new URL(url);
        if (!allowedProtocols.includes(parsed.protocol)) {
            return '';
        }
        return parsed.href;
    } catch {
        return '';
    }
}

// ================================
// 2️⃣ FILE VALIDATION
// ================================

const FILE_LIMITS = {
    PDF: {
        maxSize: 10 * 1024 * 1024, // 10 MB
        mimeTypes: ['application/pdf'],
        extensions: ['.pdf']
    },
    EXCEL: {
        maxSize: 5 * 1024 * 1024, // 5 MB
        mimeTypes: [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel'
        ],
        extensions: ['.xlsx', '.xls']
    },
    CSV: {
        maxSize: 5 * 1024 * 1024, // 5 MB
        mimeTypes: ['text/csv', 'text/plain'],
        extensions: ['.csv']
    },
    IMAGE: {
        maxSize: 10 * 1024 * 1024, // 10 MB
        mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
        extensions: ['.jpg', '.jpeg', '.png', '.webp', '.gif']
    },
    DOCUMENT: {
        maxSize: 10 * 1024 * 1024, // 10 MB
        mimeTypes: [
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/msword'
        ],
        extensions: ['.docx', '.doc']
    }
};

/**
 * Validate file type and size
 */
export function validateFile(file, fileType) {
    const limits = FILE_LIMITS[fileType];

    if (!limits) {
        throw new Error('Invalid file type configuration');
    }

    // Check file size
    if (file.size > limits.maxSize) {
        throw new Error(`File size exceeds ${limits.maxSize / (1024 * 1024)}MB limit`);
    }

    // Check MIME type
    if (!limits.mimeTypes.includes(file.type)) {
        throw new Error(`Invalid file type. Expected: ${limits.extensions.join(', ')}`);
    }

    // Check file extension
    const fileName = file.name.toLowerCase();
    const hasValidExtension = limits.extensions.some(ext => fileName.endsWith(ext));

    if (!hasValidExtension) {
        throw new Error(`Invalid file extension. Expected: ${limits.extensions.join(', ')}`);
    }

    return true;
}

/**
 * Validate multiple files
 */
export function validateFiles(files, fileType, maxFiles = 10) {
    if (!files || files.length === 0) {
        throw new Error('No files selected');
    }

    if (files.length > maxFiles) {
        throw new Error(`Maximum ${maxFiles} files allowed`);
    }

    for (const file of files) {
        validateFile(file, fileType);
    }

    return true;
}

// ================================
// 3️⃣ SAFE DATA PROCESSING
// ================================

/**
 * Safely parse JSON without executing code
 */
export function safeJsonParse(jsonString) {
    try {
        // Never use eval or Function constructor
        const parsed = JSON.parse(jsonString);
        // Sanitize the parsed object
        return sanitizeObject(parsed);
    } catch (error) {
        throw new Error('Invalid JSON format');
    }
}

/**
 * Limit array/object size to prevent DoS
 */
export function enforceDataLimits(data, maxRows = 5000, maxCols = 50) {
    if (Array.isArray(data)) {
        if (data.length > maxRows) {
            throw new Error(`Data exceeds maximum ${maxRows} rows`);
        }

        // Check column count for first row
        if (data.length > 0 && typeof data[0] === 'object') {
            const colCount = Object.keys(data[0]).length;
            if (colCount > maxCols) {
                throw new Error(`Data exceeds maximum ${maxCols} columns`);
            }
        }
    }

    return data;
}

// ================================
// 4️⃣ MEMORY CLEANUP
// ================================

/**
 * Revoke object URL to free memory
 */
export function revokeObjectUrl(url) {
    if (url && url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
    }
}

/**
 * Clear file input
 */
export function clearFileInput(inputElement) {
    if (inputElement) {
        inputElement.value = '';
    }
}

// ================================
// 5️⃣ SAFE ERROR HANDLING
// ================================

/**
 * Get user-friendly error message
 * Never expose stack traces or sensitive data
 */
export function getSafeErrorMessage(error) {
    // Known error types
    const knownErrors = {
        'File size exceeds': 'File is too large',
        'Invalid file type': 'Unsupported file format',
        'Invalid file extension': 'Unsupported file format',
        'Data exceeds maximum': 'File contains too much data',
        'Invalid JSON': 'Invalid data format',
        'Parse failed': 'Unable to process file',
        'Empty file': 'File is empty'
    };

    const errorMessage = error?.message || 'An error occurred';

    // Check for known errors
    for (const [key, message] of Object.entries(knownErrors)) {
        if (errorMessage.includes(key)) {
            return message;
        }
    }

    // Generic safe message
    return 'Unable to process file. Please try again.';
}

// ================================
// 6️⃣ STORAGE SAFETY
// ================================

const ALLOWED_STORAGE_KEYS = ['theme', 'language', 'preferences'];

/**
 * Safely store UI preferences only
 */
export function safeStorageSet(key, value) {
    if (!ALLOWED_STORAGE_KEYS.includes(key)) {
        console.warn('Attempted to store non-UI data');
        return false;
    }

    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch {
        return false;
    }
}

/**
 * Safely retrieve UI preferences
 */
export function safeStorageGet(key) {
    if (!ALLOWED_STORAGE_KEYS.includes(key)) {
        return null;
    }

    try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : null;
    } catch {
        return null;
    }
}

/**
 * Clear all temporary data
 */
export function clearTemporaryData() {
    // Don't clear UI preferences, only temporary data
    const preserve = {};

    ALLOWED_STORAGE_KEYS.forEach(key => {
        const value = localStorage.getItem(key);
        if (value) preserve[key] = value;
    });

    localStorage.clear();

    Object.entries(preserve).forEach(([key, value]) => {
        localStorage.setItem(key, value);
    });
}

// ================================
// 7️⃣ REGEX SAFETY
// ================================

/**
 * Validate regex pattern to prevent ReDoS
 */
export function validateRegex(pattern) {
    // Limit pattern length
    if (pattern.length > 1000) {
        throw new Error('Regex pattern too long');
    }

    // Check for catastrophic backtracking patterns
    const dangerousPatterns = [
        /(\w+\*)+/,  // Nested quantifiers
        /(\w+)+/,    // Nested quantifiers
        /(\w*)*$/,   // Nested quantifiers at end
    ];

    for (const dangerous of dangerousPatterns) {
        if (dangerous.test(pattern)) {
            throw new Error('Potentially unsafe regex pattern');
        }
    }

    try {
        new RegExp(pattern);
        return true;
    } catch {
        throw new Error('Invalid regex pattern');
    }
}

// ================================
// 8️⃣ CONTENT VALIDATION
// ================================

/**
 * Validate that content doesn't contain scripts
 */
export function validateContent(content) {
    if (typeof content !== 'string') return true;

    const scriptPatterns = [
        /<script/i,
        /javascript:/i,
        /on\w+\s*=/i,  // Event handlers
        /<iframe/i,
        /<object/i,
        /<embed/i
    ];

    for (const pattern of scriptPatterns) {
        if (pattern.test(content)) {
            throw new Error('Content contains potentially unsafe elements');
        }
    }

    return true;
}

// Export file limits for use in components
export { FILE_LIMITS };
