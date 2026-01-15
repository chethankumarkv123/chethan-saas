import { useEffect } from 'react';

export function useSeo({ title, description }) {
    useEffect(() => {
        // Update Title
        if (title) {
            document.title = title;
        }

        // Update Meta Description
        if (description) {
            let metaDesc = document.querySelector("meta[name='description']");
            if (!metaDesc) {
                metaDesc = document.createElement("meta");
                metaDesc.name = "description";
                document.head.appendChild(metaDesc);
            }
            metaDesc.setAttribute("content", description);
        }

        // Cleanup (Optional: revert to default, but usually not needed for SPA nav)
    }, [title, description]);
}
