import * as React from 'react';
const FlexDirectionColumn = (props) => (
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
        <path d="M6.72 15.698h2.56a.8.8 0 0 1 .8.8v2.559a.8.8 0 0 1-.8.8H6.72a.8.8 0 0 1-.8-.8v-2.559a.8.8 0 0 1 .8-.8M6.72 9.92h2.56a.8.8 0 0 1 .8.8v2.56a.8.8 0 0 1-.8.8H6.72a.8.8 0 0 1-.8-.8v-2.56c0-.441.359-.8.8-.8M6.72 4.143h2.56a.8.8 0 0 1 .8.8v2.559a.8.8 0 0 1-.8.8H6.72a.8.8 0 0 1-.8-.8V4.943a.8.8 0 0 1 .8-.8M16.08 17.031V4.555a1 1 0 0 0-2 0v12.476l-.293-.293a1 1 0 0 0-1.414 1.414l2 2a.997.997 0 0 0 1.414 0l2-2a1 1 0 0 0-1.414-1.414z" />
    </svg>
);
export default FlexDirectionColumn;
