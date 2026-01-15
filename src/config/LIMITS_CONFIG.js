export const LIMITS = {
    // Limits
    PDF_MAX_SIZE_MB: 10,
    PDF_RECOMMENDED_PAGES: 50,
    IMAGE_MAX_SIZE_MB: 10,

    // Configs
    RECENT_TOOLS_COUNT: 4
};

export const getFileSizeMB = (bytes) => (bytes / (1024 * 1024)).toFixed(1);
