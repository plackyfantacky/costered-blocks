import { TextControl } from '@wordpress/components';
import type { CSSProperties } from '@wordpress/element';

import { maybeFormat } from "@utils/common";

type Props = {
    id?: string | null;
    value: string | number;
    onChange: (value: string) => void;
    label?: string;
    placeholder?: string;
    help?: string;
    className?: string;
    style?: CSSProperties;
};

export default function TextControlInput({
    id = null,
    value,
    onChange, 
    label, 
    placeholder = "", 
    help = "",
    className,
    style
}: Props) {
    const formattedLabel = label ?
        maybeFormat(label, { toDashes: true, toSpaces: false })
        : undefined;

    const styleProp = style && Object.keys(style).length > 0 ? style : undefined;
    const classNames = ['costered-blocks--text-control', className].filter(Boolean).join(' ');
    
    return (
        <div style={styleProp} className={classNames}>
            <TextControl
                __next40pxDefaultSize
                __nextHasNoMarginBottom
                id={id || undefined}
                label={formattedLabel}
                value={value}
                onChange={(val: any) => onChange?.(String(val ?? ''))}
                placeholder={placeholder}
                help={help}
            />
        </div>
    );
}