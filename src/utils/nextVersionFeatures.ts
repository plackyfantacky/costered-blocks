declare global {
    interface Window {
        CB_NEXT_VERSION_FEATURES?: boolean | string;
    }
}

let hasInitialised = false;
let nextVersionFeaturesFlag = false;

function normaliseFlagValue(raw: unknown): boolean {
    if (typeof raw === 'boolean') {
        return raw;
    }

    if (typeof raw === 'string') {
        const value = raw.trim().toLowerCase();
        if (value === '1' || value === 'true' || value === 'yes' || value === 'on') {
            return true;
        }
    }

    return false;
}

function ensureInitialised(): void {
    if (hasInitialised) {
        return;
    }

    hasInitialised = true;

    if (typeof window === 'undefined') {
        nextVersionFeaturesFlag = false;
        return;
    }

    nextVersionFeaturesFlag = normaliseFlagValue(window.CB_NEXT_VERSION_FEATURES);

    if (nextVersionFeaturesFlag && typeof console !== 'undefined' && typeof console.info === 'function') {
        console.info('[costered] Next version features enabled (bootstrap).');
    }
}

export function nextVersionFeatures(enabled?: boolean): boolean {
    ensureInitialised();

    if (typeof enabled === 'boolean') {
        const previous = nextVersionFeaturesFlag;
        nextVersionFeaturesFlag = enabled;

        if (!previous && enabled && typeof console !== 'undefined' && typeof console.info === 'function') {
            console.info('[costered] Next version features enabled (runtime).');
        }
    }

    return nextVersionFeaturesFlag;
}
