import { FEATURES } from '../config/FEATURE_CONFIG';
import { useUI } from '../context/UIContext';

export function useFeatureGuard(featureKey) {
    const { showModal } = useUI();
    const feature = FEATURES[featureKey];

    const checkAccess = (e) => {
        if (e) e.preventDefault();

        if (!feature) {
            // If feature not defined, default to under dev for safety or log check
            console.warn(`Feature ${featureKey} not found in config`);
            showModal({
                title: "Feature Unavailable",
                message: "This feature is currently unavailable.",
                type: 'error'
            });
            return false;
        }

        if (feature.mode === 'under_development') {
            showModal({
                title: "Feature Under Development",
                message: "This feature requires cloud processing and is currently under development. We are starting with fast, privacy-first browser tools and will enable this soon.",
                type: 'development'
            });
            return false;
        }

        return true;
    };

    return {
        mode: feature?.mode || 'under_development',
        checkAccess
    };
}
