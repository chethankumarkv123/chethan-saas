import { useState } from 'react';
import { LIMITS } from '../config/LIMITS_CONFIG';

export function useFileValidation(featureKey) {
    const [errors, setErrors] = useState([]);

    const validateFiles = (files) => {
        const newErrors = [];
        const fileList = Array.from(files);

        if (fileList.length === 0) {
            return false;
        }

        // Specific Limits
        if (featureKey === 'pdfMerge' && fileList.length > LIMITS.PDF_MAX_MERGE_FILES) {
            newErrors.push(`You can merge up to ${LIMITS.PDF_MAX_MERGE_FILES} files only.`);
        }

        // Determine constraints based on feature
        let maxSize = LIMITS.PDF_MAX_SIZE_MB * 1024 * 1024;
        let typeLabel = "PDF";

        const isImageTool = /image|jpg|png|webp/i.test(featureKey);
        if (isImageTool) {
            maxSize = LIMITS.IMAGE_MAX_SIZE_MB * 1024 * 1024;
            typeLabel = "Image";
        }

        fileList.forEach(file => {
            // Check Size
            if (file.size > maxSize) {
                const limitStr = isImageTool ? LIMITS.IMAGE_MAX_SIZE_MB : LIMITS.PDF_MAX_SIZE_MB;
                newErrors.push(`${file.name}: File too large (Max ${limitStr}MB).`);
            }

            // Check Type (Improved PDF detection)
            // Some systems might not have the correct MIME type but the extension is .pdf
            const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

            if (!isImageTool && featureKey !== 'pdfTozip' && !isPdf) {
                newErrors.push(`${file.name}: This is not a valid PDF file.`);
            }
        });

        setErrors(newErrors);
        return newErrors.length === 0;
    };

    return { errors, validateFiles, setErrors };
}
