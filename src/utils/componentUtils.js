export function maybeFormat(input = '', formatting = {} ) {
    const {
        trim = true,
        toLower = false,
        toUpper = false,
        toCapitalFirst = false,
        toCapitalCase = false,
        toCamelCase = false,
        toDashes = false,
        toSpaces = false,
    } = formatting;

    let output = input;
    if (typeof output !== 'string') {
        output = String(output);
    }
    if (trim) {
        output = output.trim();
    }
    if (toLower) {
        output = output.toLowerCase();
    }
    if (toUpper) {
        output = output.toUpperCase();
    }
    if (toCapitalFirst) {
        output = output.charAt(0).toUpperCase() + output.slice(1);
    }
    if (toCapitalCase) {
        output = output.replace(/\b\w/g, (c) => c.toUpperCase());
    }
    if (toCamelCase) {
        output = output
            .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
            .replace(/^(.)/, (c) => c.toLowerCase());
    }
    if (toDashes) {
        output = output
            .replace(/([a-z])([A-Z])/g, '$1-$2')
            .replace(/[\s_]+/g, '-')
            .toLowerCase();
    }
    if (toSpaces) {
        output = output
            .replace(/([a-z])([A-Z])/g, '$1 $2')
            .replace(/[-_]+/g, ' ')
            .toLowerCase();
    }
    return output;
}