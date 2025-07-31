import { __ } from '@wordpress/i18n';

import CustomSelectControl from "@components/CustomSelectControl";

export default function DisplayInputControl({ attributes, clientId, updateAttributes }) {

    const handleChange = (value) => {
        if (!value) {
            updateAttributes(clientId, {
                ...attributes,
                display: undefined
            });
        } else {
            updateAttributes(clientId, {
                ...attributes,
                display: value
            });
        }
    };

    const displayOptions = [
        
        {
            value: 'block', content: (
                <>
                    {/* material-symbols:brick-outline-rounded (Material Symbols / license: Apache 2.0) */}
                    < svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" >
                        <path fill="currentColor" d="M2 18.5v-9q0-.625.438-1.062T3.5 8H5V5.5q0-.625.438-1.062T6.5 4h3q.625 0 1.063.438T11 5.5V8h2V5.5q0-.625.438-1.062T14.5 4h3q.625 0 1.063.438T19 5.5V8h1.5q.625 0 1.063.438T22 9.5v9q0 .625-.437 1.063T20.5 20h-17q-.625 0-1.062-.437T2 18.5m2-.5h16v-8H4zM7 8h2V6H7zm8 0h2V6h-2zM4 18h16zM7 8h2zm8 0h2z"></path>
                    </svg >
                    <span>{__('Block', 'costered-blocks')}</span>
                </>
            )
        },
        {
            value: 'inline', content: (
                <>
                    {/* material-symbols:match-word-rounded (Material Design Icons / license: Apache 2.0) */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M3 19.025q-.825 0-1.412-.587T1 17.025v-2q0-.425.288-.712T2 14.025t.713.288t.287.712v2h18v-2q0-.425.288-.713t.712-.287t.713.288t.287.712v2q0 .825-.587 1.413T21 19.025zm4.35-3.8q-1.225 0-1.925-.637t-.7-1.738q0-1.05.813-1.712t2.087-.663q.575 0 1.063.088t.837.287v-.35q0-.675-.462-1.075t-1.263-.4q-.375 0-.712.113t-.613.312q-.225.175-.487.2T5.5 9.5t-.275-.437t.15-.463q.45-.425 1.063-.65t1.387-.225q1.55 0 2.375.738t.825 2.137v3.675q0 .3-.213.513T10.3 15q-.325 0-.537-.213t-.213-.537v-.1h-.075q-.325.5-.875.788t-1.25.287m.55-3.575q-.8 0-1.225.313t-.425.887q0 .5.375.813t.975.312q.8 0 1.363-.562t.562-1.363q-.35-.2-.8-.3t-.825-.1m8.425 3.575q-1.025 0-1.562-.45t-.688-.7H14v.325q0 .3-.212.513t-.513.212t-.525-.225t-.225-.525V5.75q0-.325.225-.55t.55-.225t.55.225t.225.55V7.8L14 8.8h.075q.075-.125.6-.638t1.65-.512q1.6 0 2.525 1.15t.925 2.65t-.912 2.638t-2.538 1.137M16.1 9.05q-1 0-1.55.738T14 11.425q0 .925.55 1.65t1.55.725t1.563-.725t.562-1.65t-.562-1.65T16.1 9.05"></path>
                    </svg>
                    <span>{__('Inline', 'costered-blocks')}</span>
                </>
            )
        },
        {
            value: 'flex', content: (
                <>
                    {/* material-symbols:flex-no-wrap-rounded (Material Design Icons / license: Apache 2.0) */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M1 16V8q0-.425.288-.712T2 7h4q.425 0 .713.288T7 8v8q0 .425-.288.713T6 17H2q-.425 0-.712-.288T1 16m8 0V8q0-.425.288-.712T10 7h4q.425 0 .713.288T15 8v8q0 .425-.288.713T14 17h-4q-.425 0-.712-.288T9 16m8 0V8q0-.425.288-.712T18 7h4q.425 0 .713.288T23 8v8q0 .425-.288.713T22 17h-4q-.425 0-.712-.288T17 16M3 15h2V9H3zm16 0h2V9h-2z"></path>
                    </svg>
                    <span>{__('Flex', 'costered-blocks')}</span>
                </>
            )
        },
        {
            value: 'grid', content: (
                <>
                    {/* material-symbols:grid-view-rounded (Material Design Icons / license: Apache 2.0) */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M3 3h8v8H3zm10 0h8v8h-8zm-10 10h8v8H3zm10 0h8v8h-8z"></path>
                    </svg>
                    <span>{__('Grid', 'costered-blocks')}</span>
                </>
            )
        },
        {
            value: 'none', content: (
                <>
                    {/* mdi:border-none-variant (Material Design Icons / license: Apache 2.0) */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M15 5h2V3h-2m0 18h2v-2h-2M11 5h2V3h-2m8 2h2V3h-2m0 6h2V7h-2m0 14h2v-2h-2m0-6h2v-2h-2m0 6h2v-2h-2M3 5h2V3H3m0 6h2V7H3m0 6h2v-2H3m0 6h2v-2H3m0 6h2v-2H3m8 2h2v-2h-2m-4 2h2v-2H7M7 5h2V3H7z"></path>
                    </svg>
                    <span>{__('None', 'costered-blocks')}</span>
                </>
            )
        },
    ];

    return (
        <CustomSelectControl
            label={__('Display', 'costered-blocks')}
            value={ typeof attributes?.display === "string" ? attributes.display : "" }
            onChange={handleChange}
            options={displayOptions}
        />
    );
}
