import domReady from '@wordpress/dom-ready';

domReady(() => {
    const observer = new MutationObserver(() => {

        // Hide the "Inner blocks use content width" toggle control
        const labels = document.querySelectorAll('.components-toggle-control__label');
        labels.forEach((label) => {
            if (label.textContent.trim() === 'Inner blocks use content width') {
                const panel = label.closest('.components-panel__body');
                if (panel) {
                    panel.style.display = 'none';
                }
            }
        });

        //Hide the top-level "Width" control from core/Button
        const widthControls = document.querySelectorAll('span.components-base-control__label ');
        
        widthControls.forEach((control) => {
            if (control.textContent.trim() === 'Width') {
                const panel = control.closest('.components-grid.components-tools-panel');
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
