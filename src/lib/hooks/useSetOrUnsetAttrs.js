export const useSetOrUnsetAttrs = (key, attributes, updateAttributes, clientId) => (value) => {
    updateAttributes(clientId, {
        ...attributes,
        [key]: (value === '' || value == null) ? undefined : value
    });
}