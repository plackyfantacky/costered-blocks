import { useEffect, useRef, cloneElement } from '@wordpress/element';
import { addFilter } from '@wordpress/hooks';

addFilter('editor.BlockEdit', 'costered-blocks/common--inject-margin-styles', (BlockEdit) => (props) => {
    const { name, attributes } = props;

    if (![
        'core/group',
        'core/button'
    ].includes(name)) {
        return <BlockEdit {...props} />;
    }

    const {
        marginTop,
        marginRight,
        marginBottom,
        marginLeft,
        marginMode
    } = attributes;

    const ref = useRef();

    useEffect(() => {
        if (!ref.current || marginMode !== 'custom') return;

        const el = ref.current.querySelector('[data-block]');
        if (!el) return;

        el.style.marginTop = marginTop || '';
        el.style.marginRight = marginRight || '';
        el.style.marginBottom = marginBottom || '';
        el.style.marginLeft = marginLeft || '';
    }, [marginTop, marginRight, marginBottom, marginLeft, marginMode]);

    const element = <BlockEdit {...props} />;

    return cloneElement(element, {ref});
});