import domReady from '@wordpress/dom-ready';

domReady(() => {
    const observer = new MutationObserver(() => {
        const labels = document.querySelectorAll('.components-toggle-control__label');
        labels.forEach((label) => {
            if (label.textContent.trim() === 'Inner blocks use content width') {
                const panel = label.closest('.components-panel__body');
                if (panel) {
                    panel.style.display = 'none';
                }
            }
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
});

console.log('Hide Inner Blocks.');