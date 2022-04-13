import * as vscode from 'vscode';
import { SelCommand } from './SelCommand';

export class DebuggerViewProvider implements vscode.WebviewViewProvider {

	public static readonly viewType = 'selDebugger';
	public static selCommand: SelCommand;
	private _view?: vscode.WebviewView;
	public locator: string;
	public parentLocator: string;
	private _extensionUri: any;

	constructor(private context: vscode.ExtensionContext) {
		this._extensionUri = this.context.extensionUri

	}

	getLocator(): string{
		return this.context.workspaceState.get("locator")
	}

	setLocator(locator: string){
		this.locator = locator
		this.context.workspaceState.update("locator", this.locator)
	}

	getParentLocator(){
		return this.context.workspaceState.get("parentLocator")
	}

	setParentLocator(parentLocator: string){
		this.parentLocator = parentLocator
		this.context.workspaceState.get("parentLocator", this.parentLocator)
	}

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
						this.setLocator(await DebuggerViewProvider.selCommand.selectElement())
						this._view.webview.postMessage({ type: 'selectElement', value: this.locator });
						break;
					}
				case 'selectParentElement':
					{
						this.setParentLocator(await DebuggerViewProvider.selCommand.selectElement())
						DebuggerViewProvider.selCommand.setParent(this.parentLocator)
						this._view.webview.postMessage({ type: 'selectParentElement', value: this.parentLocator });
						break;
					}
				case 'highlight':
					{
						let text = await DebuggerViewProvider.selCommand.highlight(this.locator)
						if(text) {
							vscode.window.showInformationMessage(text);
						}
						break;
					}
				case 'highlightParent':
					{
						let text = await DebuggerViewProvider.selCommand.highlight(DebuggerViewProvider.selCommand.getParent(), true)
						if(text) {
							vscode.window.showInformationMessage(text);
						}
						break;
					}
				case 'updateLocator':
					{
						this.setLocator(data.value)
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

		const codiconsUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'node_modules', '@vscode/codicons', 'dist', 'codicon.css'));

		// Use a nonce to only allow a specific script to be run.
		const nonce = getNonce();

		return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">

				<!--
					Use a content security policy to only allow loading specific resources in the webview
				-->
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; font-src ${webview.cspSource}; style-src ${webview.cspSource};  script-src 'nonce-${nonce}';">

				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<link href="${styleResetUri}" rel="stylesheet">
				<link href="${styleVSCodeUri}" rel="stylesheet">
				<link href="${styleMainUri}" rel="stylesheet">

				<link href="${codiconsUri}" rel="stylesheet" />
				<title>Cat Colors</title>
			</head>
			<body>
				<div class="parentLocatorArea">
					<button class="expendArrow">
						<i class="codicon codicon-fold-up"></i> 
					</button>
					<input class="locatorBox" placeholder="enter parent locator here" value="${this.getParentLocator() || ""}">  </input>
					<button class="selectElement" title="select element">
						<i class="codicon codicon-search"></i>
					</button>
					<button class="highlight" title="highligh element">
						<i class="codicon codicon-lightbulb"></i>
					</button>
				</div>
				<div class="locatorArea">
					<button class="expendArrow">
						<i class="codicon codicon-fold-up"></i> 
					</button>
					<input class="locatorBox" placeholder="enter element locator here" value="${this.getLocator() || ""}">  </input>
					<button class="selectElement" title="select element">
						<i class="codicon codicon-search"></i>
					</button>
					<button class="highlight" title="highligh element">
						<i class="codicon codicon-lightbulb"></i>
					</button>
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