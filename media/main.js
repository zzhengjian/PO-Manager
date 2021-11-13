//@ts-check

// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.
(function () {
    // @ts-ignore
    const vscode = acquireVsCodeApi();

    document.querySelector('.locatorArea .expendArrow').addEventListener('click', () => {
        let ele = document.querySelector('.locatorArea .expendArrow .codicon')
        if(ele.classList.contains("codicon-fold-up")){
            // @ts-ignore
            document.querySelector('.parentLocatorArea').style.display = "flex"
            ele.classList.remove("codicon-fold-up")
            ele.classList.add("codicon-fold")
            // @ts-ignore
            vscode.postMessage({ type: 'updateParentLocator', value: document.querySelector('.parentLocatorArea > input.locatorBox').value});
        }
        else{
            // @ts-ignore
            document.querySelector('.parentLocatorArea').style.display = "none"
            ele.classList.remove("codicon-fold")
            ele.classList.add("codicon-fold-up")
            vscode.postMessage({ type: 'updateParentLocator', value: ""});
        }

    });

    document.querySelector('.locatorArea .selectElement').addEventListener('click', () => {
        vscode.postMessage({ type: 'selectElement'});
    });

    document.querySelector('.locatorArea > .locatorBox').addEventListener('input', () => {
        // @ts-ignore
        vscode.postMessage({ type: 'updateLocator', value: document.querySelector('.locatorArea > input.locatorBox').value});
    });

    document.querySelector('.locatorArea .highlight').addEventListener('click', () => {
        vscode.postMessage({ type: 'highlight'});
    });

    document.querySelector('.parentLocatorArea .selectElement').addEventListener('click', () => {
        vscode.postMessage({ type: 'selectParentElement'});
    });

    document.querySelector('.parentLocatorArea > .locatorBox').addEventListener('input', () => {
        // @ts-ignore
        vscode.postMessage({ type: 'updateParentLocator', value: document.querySelector('.parentLocatorArea > input.locatorBox').value});
    });

    document.querySelector('.parentLocatorArea .highlight').addEventListener('click', () => {
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


