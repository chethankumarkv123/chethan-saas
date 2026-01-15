import { useState } from 'react';
import { LIMITS } from '../config/LIMITS_CONFIG';

export function useFileValidation(featureKey) {
    const [errors, setErrors] = useState([]);

    const validateFiles = (files) => {
        const newErrors = [];
        const fileList = Array.from(files);

        if (fileList.length === 0) {
            // newErrors.push("Please select a file.");
            return false;
        }

        // Specific Limits
        if (featureKey === 'pdfMerge' && fileList.length > LIMITS.maxMergeFiles) {
            newErrors.push(`You can merge up to ${LIMITS.maxMergeFiles} files only.`);
        }

        // Determine constraints based on feature
        let maxSize = LIMITS.maxPdfSizeMB * 1024 * 1024;
        let typeLabel = "PDF";

        const isImageTool = /image|jpg|png|webp/i.test(featureKey);
        if (isImageTool) {
            maxSize = LIMITS.maxImageSizeMB * 1024 * 1024;
            typeLabel = "Image";
        }

        fileList.forEach(file => {
            // Check Size
            if (file.size > maxSize) {
                newErrors.push(`${file.name}: File too large (Max ${isImageTool ? LIMITS.maxImageSizeMB : LIMITS.maxPdfSizeMB}MB).`);
            }

            // Check Type (Basic)
            if (!isImageTool && featureKey !== 'pdfTozip' && !file.type.includes('pdf')) { // loose check
                // newErrors.push(`${file.name}: Not a PDF file.`);
            }
        });

        setErrors(newErrors);
        return newErrors.length === 0;
    };

    return { errors, validateFiles, setErrors };
}
