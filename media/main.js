//@ts-check

// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.
(function () {
    // @ts-ignore
    const vscode = acquireVsCodeApi();

    document.querySelector('.locatorArea .selectElement').addEventListener('click', () => {
        vscode.postMessage({ type: 'selectElement'});
    });

    document.querySelector('.locatorArea > input.locatorBox').addEventListener('onchange', () => {
        // @ts-ignore
        vscode.postMessage({ type: 'updateLocator', value: document.querySelector('.locatorArea > input.locatorBox').value});
    });

    document.querySelector('.locatorArea .highlight').addEventListener('click', () => {
        vscode.postMessage({ type: 'highlight'});
    });

    document.querySelector('.parentLocatorArea .selectElement').addEventListener('click', () => {
        vscode.postMessage({ type: 'selectParentElement'});
    });

    document.querySelector('.parentLocatorArea > input.locatorBox').addEventListener('onchange', () => {
        // @ts-ignore
        vscode.postMessage({ type: 'updateParentLocator', value: document.querySelector('.parentLocatorArea > input.locatorBox').value});
    });

    document.querySelector('.parentLocatorArea  .highlight').addEventListener('click', () => {
        vscode.postMessage({ type: 'highlightParent'});
    });

    // Handle messages sent from the extension to the webview
    window.addEventListener('message', event => {
        const message = event.data; // The json data that the extension sent
        switch (message.type) {
            case 'selectElement':
                {
                    // @ts-ignore
                    document.querySelector('.locatorArea .locatorBox').value = message.value 
                    break;
                }
            case 'selectParentElement':
                {
                    // @ts-ignore
                    document.querySelector('.parentLocatorArea .locatorBox').value = message.value 
                    break;
                }

        }
    });
}());


