import * as React from 'react';
const PositionAbsolute = (props) => (
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
        <path d="M2.6 22a.6.6 0 0 1-1.2 0V2a.6.6 0 0 1 .6-.6h20a.6.6 0 0 1 0 1.2H2.6z" />
        <path d="M20.15 12.925v5.76a1.12 1.12 0 0 1-1.12 1.12h-8.26a1.12 1.12 0 0 1-1.12-1.12v-5.76c0-.618.502-1.12 1.12-1.12h8.26c.618 0 1.12.502 1.12 1.12m-9.3.08v5.6h8.1v-5.6zM4.715 15.305h2.808v-.296a.5.5 0 0 1 1 0v1.592a.5.5 0 0 1-1 0v-.296H4.715v.296a.5.5 0 0 1-1 0v-1.592a.5.5 0 0 1 1 0zM14.394 9.684l.005-5.122-.296-.001a.5.5 0 0 1 .001-1l1.592.002a.5.5 0 1 1-.001 1h-.296l-.005 5.122.296.001a.5.5 0 1 1-.001 1l-1.592-.002a.5.5 0 1 1 .001-1z" />
    </svg>
);
export default PositionAbsolute;
