import { useState, useCallback } from 'react';
import { useUI } from '../context/UIContext';

export function useApi() {
    const [isLoading, setIsLoading] = useState(false);
    const { showModal } = useUI();

    const callApi = useCallback(async (endpoint, formData) => {
        setIsLoading(true);
        try {
            // 30 Seconds Timeout
            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), 30000);

            const response = await fetch(endpoint, {
                method: 'POST',
                body: formData,
                signal: controller.signal
            });

            clearTimeout(id);

            if (response.status === 403) {
                const data = await response.json().catch(() => ({}));
                if (data.status === 'under_development' || data.message === 'Under Development') {
                    showModal({
                        title: "Feature Under Development",
                        message: "This feature requires cloud processing and is currently under development. We are starting with fast, privacy-first browser tools and will enable this soon.",
                        type: 'development'
                    });
                    return null;
                }
            }

            if (!response.ok) {
                throw new Error(`Request failed with status ${response.status}`);
            }

            // Check content type
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            } else {
                // Return blob for file downloads
                return await response.blob();
            }

        } catch (error) {
            console.error("API Error:", error);

            let message = "An error occurred while communicating with the server.";
            if (error.name === 'AbortError') {
                message = "Request timed out. The operation took too long.";
            } else if (error.message.includes('Failed to fetch')) {
                message = "Network error. Please check your internet connection.";
            }

            showModal({
                title: "Operation Failed",
                message: message,
                type: 'error'
            });
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [showModal]);

    return { callApi, isLoading };
}
