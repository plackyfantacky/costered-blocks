import * as React from 'react';
const Position = (props) => (
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
        <path d="M16 9.12v5.76A1.12 1.12 0 0 1 14.88 16H9.12A1.12 1.12 0 0 1 8 14.88V9.12C8 8.502 8.502 8 9.12 8h5.76c.618 0 1.12.502 1.12 1.12m-6.8.08v5.6h5.6V9.2zM11.505 1.495a.7.7 0 0 1 .99 0l1.26 1.26a.7.7 0 0 1-.99.99L12.7 3.68V6a.7.7 0 0 1-1.4 0V3.68l-.065.065a.7.7 0 0 1-.99-.99zM11.3 20.32V18a.7.7 0 0 1 1.4 0v2.32l.065-.065a.7.7 0 0 1 .99.99l-1.26 1.26a.7.7 0 0 1-.99 0l-1.26-1.26a.7.7 0 0 1 .99-.99zM1.495 11.505l1.26-1.26a.7.7 0 0 1 .99.99l-.065.065H6a.7.7 0 0 1 0 1.4H3.68l.065.065a.7.7 0 0 1-.99.99l-1.26-1.26a.7.7 0 0 1 0-.99M20.32 11.3l-.065-.065a.7.7 0 0 1 .99-.99l1.26 1.26a.7.7 0 0 1 0 .99l-1.26 1.26a.7.7 0 0 1-.99-.99l.065-.065H18a.7.7 0 0 1 0-1.4z" />
    </svg>
);
export default Position;
