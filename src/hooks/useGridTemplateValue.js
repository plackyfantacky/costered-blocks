export function useGridTemplateValue(input = "") {
    if (input !== "") {
        const match = input.match(/repeat\((\d+),\s*1fr\)/);
        if (match) {
            return parseInt(match[1], 10);
        } else if (input === '1fr') {
            return 1;
        }
    }
    return 0;
}