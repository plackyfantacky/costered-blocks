export const ensureShape = (costered) => {
    const safe = {
        desktop: { styles: {} },
        tablet: { styles: {} },
        mobile: { styles: {} },
        ...(costered || {})
    };

    safe.desktop = { styles: {}, ...(safe.desktop || {}) };
    safe.tablet = { styles: {}, ...(safe.tablet || {}) };
    safe.mobile = { styles: {}, ...(safe.mobile || {}) };

    safe.desktop.styles = { ...(safe.desktop.styles || {}) };
    safe.tablet.styles = { ...(safe.tablet.styles || {}) };
    safe.mobile.styles = { ...(safe.mobile.styles || {}) };
    
    return safe;
};

export const deleteOrSet = (obj, key, value) => {
    if (value === undefined || value === null || value === '') {
        if (Object.prototype.hasOwnProperty.call(obj, key)) delete obj[key];
    } else {
        obj[key] = value;
    }
};

export const isUnsetLike = (value) => 
    value === undefined || value === null || value === '' || value === 'null' || value === 'undefined';