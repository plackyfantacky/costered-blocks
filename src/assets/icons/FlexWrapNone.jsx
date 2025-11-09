import * as React from 'react';
const FlexWrapNone = (props) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        xmlSpace="preserve"
        style={{
            fillRule: 'evenodd',
            clipRule: 'evenodd',
            strokeLinejoin: 'round',
            strokeMiterlimit: 2,
        }}
        viewBox="0 0 24 24"
        {...props}
    >
        <path
            d="M0 0h24v24H0z"
            style={{
                fill: 'none',
            }}
        />
        <path d="M6.5 11.05v1.9a.8.8 0 0 1-.8.8H3.8a.8.8 0 0 1-.8-.8v-1.9a.8.8 0 0 1 .8-.8h1.9a.8.8 0 0 1 .8.8M11.5 11.05v1.9a.8.8 0 0 1-.8.8H8.8a.8.8 0 0 1-.8-.8v-1.9a.8.8 0 0 1 .8-.8h1.9a.8.8 0 0 1 .8.8M18.586 13h-4.42a1 1 0 0 1 0-2h4.42l-.293-.293a1 1 0 0 1 1.414-1.414l2 2a.997.997 0 0 1 0 1.414l-2 2a1 1 0 0 1-1.414-1.414z" />
    </svg>
);
export default FlexWrapNone;
