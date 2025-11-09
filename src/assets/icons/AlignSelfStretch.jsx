import * as React from 'react';
const AlignSelfStretch = (props) => (
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
        <path d="M15.508 11.046v1.9a.8.8 0 0 1-.8.8h-5.4a.8.8 0 0 1-.8-.8v-1.9a.8.8 0 0 1 .8-.8h5.4c.441 0 .8.359.8.8M12.735 6.514v1.782a.728.728 0 0 1-1.455 0V6.514l-.213.213a.728.728 0 0 1-1.029-1.029l1.455-1.455a.726.726 0 0 1 1.029 0l1.455 1.455a.728.728 0 0 1-1.029 1.029zM11.291 17.482v-1.785a.729.729 0 0 1 1.457 0v1.785l.214-.214a.73.73 0 0 1 1.03 1.031l-1.457 1.456a.727.727 0 0 1-1.03 0l-1.457-1.456a.728.728 0 1 1 1.03-1.031zM20.044 1.191a.8.8 0 1 1 .001 1.6l-16.072.016a.8.8 0 0 1-.001-1.6zM20.044 21.191a.8.8 0 1 1 .001 1.6l-16.072.016a.8.8 0 0 1-.001-1.6z" />
    </svg>
);
export default AlignSelfStretch;
