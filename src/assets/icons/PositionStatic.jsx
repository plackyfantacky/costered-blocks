import * as React from 'react';
const PositionStatic = (props) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        xmlSpace="preserve"
        width={24}
        height={24}
        style={{
            fillRule: 'evenodd',
            clipRule: 'evenodd',
            strokeLinejoin: 'round',
            strokeMiterlimit: 2,
        }}
        {...props}
    >
        <path
            d="M0 0h24v24H0z"
            style={{
                fill: 'none',
            }}
        />
        <path d="M22 9.12v5.76A1.12 1.12 0 0 1 20.88 16H3.12A1.12 1.12 0 0 1 2 14.88V9.12C2 8.502 2.502 8 3.12 8h17.76c.618 0 1.12.502 1.12 1.12M3.2 9.2v5.6h17.6V9.2zM2.5 3.2a.7.7 0 0 1 0-1.4h10a.7.7 0 0 1 0 1.4zM2.5 22.2a.7.7 0 0 1 0-1.4h10a.7.7 0 0 1 0 1.4zM2.5 5.2a.7.7 0 0 1 0-1.4h17a.7.7 0 0 1 0 1.4zM2.5 20.2a.7.7 0 0 1 0-1.4h17a.7.7 0 0 1 0 1.4zM2.5 7.2a.7.7 0 0 1 0-1.4h14a.7.7 0 0 1 0 1.4zM2.5 18.2a.7.7 0 0 1 0-1.4h14a.7.7 0 0 1 0 1.4z" />
    </svg>
);
export default PositionStatic;
