import * as React from 'react';
const PositionSticky = (props) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        xmlSpace="preserve"
        width={24}
        height={24}
        style={{
            fillRule: 'evenodd',
            clipRule: 'evenodd',
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            strokeMiterlimit: 1.5,
        }}
        {...props}
    >
        <path
            d="M0 0h24v24H0z"
            style={{
                fill: 'none',
            }}
        />
        <path d="M21 17.7v3.6a.7.7 0 0 1-.7.7H5.7a.7.7 0 0 1-.7-.7v-3.6a.7.7 0 0 1 .7-.7h14.6a.7.7 0 0 1 .7.7m-14.8.5v2.6h13.6v-2.6z" />
        <path
            d="M5.5 5h15v4h-15z"
            style={{
                fill: 'none',
                stroke: '#000',
                strokeWidth: '1.2px',
                strokeDasharray: '0,1.5,0,1.5,0,1.5',
                strokeDashoffset: 3.6,
            }}
        />
        <path d="M2.6 22a.6.6 0 0 1-1.2 0V2a.6.6 0 0 1 .6-.6h20a.6.6 0 0 1 0 1.2H2.6z" />
        <path d="m12.496 14.585.002-2.671-.121.121a.5.5 0 0 1-.707-.708l.976-.974a.5.5 0 0 1 .707.001l.974.976a.5.5 0 0 1-.707.706l-.122-.121-.002 2.671.122-.121a.5.5 0 1 1 .706.708l-.976.974a.497.497 0 0 1-.707-.001l-.974-.976a.5.5 0 1 1 .708-.706z" />
    </svg>
);
export default PositionSticky;
