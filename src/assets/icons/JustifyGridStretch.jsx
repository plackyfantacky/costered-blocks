import * as React from 'react';
const JustifyGridStretch = (props) => (
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
        <path d="M9.056 10.499h5.9a.8.8 0 0 1 .8.8v1.4a.8.8 0 0 1-.8.8h-5.9a.8.8 0 0 1-.8-.8v-1.4c0-.441.359-.8.8-.8M5.527 11.46h1.324a.541.541 0 0 1 0 1.082H5.527l.158.159a.54.54 0 1 1-.765.764l-1.081-1.081a.54.54 0 0 1 0-.765l1.081-1.082a.541.541 0 0 1 .765.765zM18.488 12.541h-1.326a.542.542 0 0 1 0-1.083h1.326l-.159-.159a.543.543 0 0 1 .766-.766l1.083 1.083a.54.54 0 0 1 0 .766l-1.083 1.083a.54.54 0 1 1-.766-.766zM1.201 3.964a.8.8 0 1 1 1.6-.002l.015 16.073a.799.799 0 1 1-1.6.001zM21.201 3.964a.8.8 0 1 1 1.6-.002l.015 16.073a.799.799 0 1 1-1.6.001z" />
    </svg>
);
export default JustifyGridStretch;
