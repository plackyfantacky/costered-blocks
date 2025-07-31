import { __ } from '@wordpress/i18n';

import CustomSelectControl from "@components/CustomSelectControl";

export default function VisibilityInputControl({ attributes, clientId, updateAttributes }) {

    const handleChange = (value) => {
        if (!value) {
            updateAttributes(clientId, {
                ...attributes,
                visibility: undefined
            });
        } else {
            updateAttributes(clientId, {
                ...attributes,
                visibility: value
            });
        }
    };

    const visibilityOptions = [
        {
            value: 'visible', content: (
                <>
                    {/* mdi:eye-outline (Material Design Icons / license: Apache 2.0) */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M12 9a3 3 0 0 1 3 3a3 3 0 0 1-3 3a3 3 0 0 1-3-3a3 3 0 0 1 3-3m0-4.5c5 0 9.27 3.11 11 7.5c-1.73 4.39-6 7.5-11 7.5S2.73 16.39 1 12c1.73-4.39 6-7.5 11-7.5M3.18 12a9.821 9.821 0 0 0 17.64 0a9.821 9.821 0 0 0-17.64 0"></path>
                    </svg>
                    <span>{__('Visible', 'costered-blocks')}</span>
                </>
            )
        },
        {
            value: 'hidden', content: (
                <>
                    {/* mdi:eye-off-outline (Material Design Icons / license: Apache 2.0) */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M12 9a3 3 0 0 1 3 3a3 3 0 0 1-3 3a3 3 0 0 1-3-3a3 3 0 0 1 3-3m0-4.5c5 0 9.27 3.11 11 7.5c-1.73 4.39-6 7.5-11 7.5S2.73 16.39 1 12c1.73-4.39 6-7.5 11-7.5M2.18 12a9.821 9.821 0 0 0 17.64 0l-2.12-2.12A7.321 7.321 0 0 1 12.18 14a7.321 7.321 0 0 1-4.52-1.62L2.18 12z"></path>
                    </svg>
                    <span>{__('Hidden', 'costered-blocks')}</span>
                </>
            )
        },

        {
            value: 'collapse', content: (
                <>
                    {/* iconoir:collapse (Iconoir  / license: MIT) */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
                        <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="m20 20l-5-5m0 0v4m0-4h4M4 20l5-5m0 0v4m0-4H5M20 4l-5 5m0 0V5m0 4h4M4 4l5 5m0 0V5m0 4H5"></path>
                    </svg>
                    <span>{__('Collapse', 'costered-blocks')}</span>
                </>
            )
        },


    ];

    return (
        <CustomSelectControl
            label={__('Visibility', 'costered-blocks')}
            value={typeof attributes?.visibility === "string" ? attributes.visibility : ""}
            onChange={handleChange}
            options={visibilityOptions}
        />
    );
}
