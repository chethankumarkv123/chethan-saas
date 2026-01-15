export const LIMITS = {
    // PDF Limits
    PDF_MAX_SIZE_MB: 20,
    PDF_MAX_MERGE_FILES: 10,
    PDF_RECOMMENDED_PAGES: 50,

    // Image Limits
    IMAGE_MAX_SIZE_MB: 10,

    // General
    RECENT_TOOLS_COUNT: 4
};

export const getFileSizeMB = (bytes) => (bytes / (1024 * 1024)).toFixed(1);
