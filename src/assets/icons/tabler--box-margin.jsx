const TablerBoxMargin = ({ size = 24, ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} {...props}>
        <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 8h8v8H8zM4 4v.01M8 4v.01M12 4v.01M16 4v.01M20 4v.01M4 20v.01M8 20v.01m4-.01v.01m4-.01v.01m4-.01v.01M20 16v.01M20 12v.01M20 8v.01M4 16v.01M4 12v.01M4 8v.01" />
    </svg>
);
export default TablerBoxMargin;
