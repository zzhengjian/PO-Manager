import * as vscode from 'vscode';
import { SelCommand } from './SelCommand';

export class DebuggerViewProvider implements vscode.WebviewViewProvider {

	public static readonly viewType = 'selDebugger.debuggerView';
	public static selCommand: SelCommand;
	private _view?: vscode.WebviewView;
	private locator: String;

	constructor(
		private readonly _extensionUri: vscode.Uri
	) { }

	public resolveWebviewView(
		webviewView: vscode.WebviewView,
		context: vscode.WebviewViewResolveContext,
		_token: vscode.CancellationToken,
	) {
		this._view = webviewView;

		webviewView.webview.options = {
			// Allow scripts in the webview
			enableScripts: true,

			localResourceRoots: [
				this._extensionUri
			]
		};

		webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

		webviewView.webview.onDidReceiveMessage(async data => {
			switch (data.type) {
				case 'selectElement':
					{
						this.locator = await DebuggerViewProvider.selCommand.selectElement()
						this._view.webview.postMessage({ type: 'selectElement', value: this.locator });
						break;
					}
				case 'selectParentElement':
					{
						let parentLocator = await DebuggerViewProvider.selCommand.selectElement()
						DebuggerViewProvider.selCommand.setParent(parentLocator)
						this._view.webview.postMessage({ type: 'selectParentElement', value: parentLocator });
						break;
					}
				case 'highlight':
					{
						await DebuggerViewProvider.selCommand.highlight(this.locator)
						break;
					}
				case 'highlightParent':
					{
						await DebuggerViewProvider.selCommand.highlight(DebuggerViewProvider.selCommand.getParent(), true)
						break;
					}
				case 'updateLocator':
					{
						this.locator = data.value
						break;
					}
				case 'updateParentLocator':
					{
						DebuggerViewProvider.selCommand.setParent(data.value)
						break;
					}
			}
		});
	}

	private _getHtmlForWebview(webview: vscode.Webview) {
		// Get the local path to main script run in the webview, then convert it to a uri we can use in the webview.
		const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'main.js'));

		// Do the same for the stylesheet.
		const styleResetUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'reset.css'));
		const styleVSCodeUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'vscode.css'));
		const styleMainUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'main.css'));

		const selectIcon = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'select.png'));
		const highlightIcon = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'highlight.png'));
		// Use a nonce to only allow a specific script to be run.
		const nonce = getNonce();

		return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">

				<!--
					Use a content security policy to only allow loading images from https or from our extension directory,
					and only allow scripts that have a specific nonce.
				-->
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">

				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<script src="https://kit.fontawesome.com/a076d05399.js" crossorigin="anonymous"></script>
				<link href="${styleResetUri}" rel="stylesheet">
				<link href="${styleVSCodeUri}" rel="stylesheet">
				<link href="${styleMainUri}" rel="stylesheet">
				
				<title>Cat Colors</title>
			</head>
			<body>
				<div class="parentLocatorArea">
					<input class="locatorBox"> </input>
					<button class="selectElement" title="select element">S</button>
					<button class="highlight" title="highligh element">H</button>
				</div>
				<div class="locatorArea">
					<input class="locatorBox"> </input>
					<button class="selectElement" title="select element">S</button>
					<button class="highlight" title="highligh element">H</button>
				</div>
				<script nonce="${nonce}" src="${scriptUri}"></script>
			</body>
			</html>`;
	}
}

function getNonce() {
	let text = '';
	const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (let i = 0; i < 32; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}