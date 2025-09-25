export const isValidCosteredId = (value) => typeof value === 'string' && value.trim().length > 0;

export const generateCosteredId = () => {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }
    //fallback for older environments
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).slice(2, 10);
    return `${timestamp}-${random}`;
};

/**
 * Ensure the attributes object has a stable costeredId.
 * Mutates the given attrs object (your updaters already clone before calling).
 */
export const seedCosteredId = (attrs) => {
    if (attrs && !isValidCosteredId(attrs.costeredId)) {
        attrs.costeredId = generateCosteredId();
    }
};
