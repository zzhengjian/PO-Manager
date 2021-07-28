import * as vscode from 'vscode';
import * as json from 'jsonc-parser';
import * as path from 'path';
var jsonFormat = require('json-format')

export class JsonOutlineProvider implements vscode.TreeDataProvider<number> {

	private _onDidChangeTreeData: vscode.EventEmitter<number | null> = new vscode.EventEmitter<number | null>();
	readonly onDidChangeTreeData: vscode.Event<number | null> = this._onDidChangeTreeData.event;
	private _onDidChangeWindowState: vscode.EventEmitter<vscode.WindowState | null> = new vscode.EventEmitter<vscode.WindowState | null>();
	readonly onDidChangeWindowState: vscode.Event<vscode.WindowState | null> = this._onDidChangeWindowState.event;

	private tree: json.Node;
	private text: string;
	private editor: vscode.TextEditor;
	private autoRefresh = true;

	constructor(private context: vscode.ExtensionContext) {
		vscode.window.onDidChangeActiveTextEditor(() => this.onActiveEditorChanged());
		vscode.workspace.onDidChangeTextDocument(e => this.onDocumentChanged(e));
		this.parseTree();
		this.autoRefresh = vscode.workspace.getConfiguration('jsonOutline').get('autorefresh');
		vscode.workspace.onDidChangeConfiguration(() => {
			this.autoRefresh = vscode.workspace.getConfiguration('jsonOutline').get('autorefresh');
		});
		this.onActiveEditorChanged();
	}

	refresh(offset?: number): void {
		this.parseTree();
		if (offset) {
			this._onDidChangeTreeData.fire(offset);
		} else {
			this._onDidChangeTreeData.fire(undefined);
		}
	}

	getLocator(offset?: number): string {
		const location = json.getLocation(this.text, offset)
		const jPath = location.path;
		let propertyNode = json.findNodeAtLocation(this.tree, jPath);
		let node = json.getNodeValue(propertyNode)
		return node
	}

	rename(offset: number): void {
		
		vscode.window.showInputBox({ placeHolder: 'Enter the new label' })
			.then(value => {
				if (value !== null && value !== undefined) {
					this.editor.edit(editBuilder => {
						const location = json.getLocation(this.text, offset)
						const path = location.path;
						let propertyNode = json.findNodeAtLocation(this.tree, path);
						let node = json.getNodeValue(propertyNode)
						
						if (propertyNode.parent.type !== 'array') {
							propertyNode = propertyNode.parent.children[0];
						}
						const range = new vscode.Range(this.editor.document.positionAt(propertyNode.offset), this.editor.document.positionAt(propertyNode.offset + propertyNode.length));
						editBuilder.replace(range, `"${value}"`);
						setTimeout(() => {
							this.parseTree();
							this.refresh(offset);
						}, 100);
					});
				}
			});
	}

	updateLocator(locator: string): void {
		this.editor.edit(editBuilder => {
			let selection = this.editor.selection
			let ele = parse_locator(locator)
			editBuilder.replace(new vscode.Range(selection.start, selection.end), jsonFormat(ele));
		});

		function parse_locator(locator) {
			if (!locator) {
			  throw new TypeError('Locator cannot be empty')
			}
			const result = locator.match(/^([A-Za-z]+)=.+/)
			if (result) {
			  let type = result[1]
			  const length = type.length
			  const actualLocator = locator.substring(length + 1)
			  return { type: type, locator: actualLocator }
			}
			throw new Error(
			  'Implicit locators are obsolete, please prepend the strategy (e.g. id=element).'
			)
		  }
	}

	addElement(element: string): void {
		this.editor.edit(editBuilder => {
			let selection = this.editor.selection
			let eleString = jsonFormat(JSON.parse(element))
			let insertText = ""
			let before = this.editor.document.getText(new vscode.Range(new vscode.Position(0, 0), selection.start)).trim()
			let after = this.editor.document.getText(new vscode.Range(selection.start, new vscode.Position(this.editor.document.lineCount, 0))).trim()

			if(!before && !after){
				//insert to blank file
				insertText = eleString
			}
			else if(!before.slice(1).trim() && !after.slice(0,-1).trim()){
				//insert to file with {}
				insertText = eleString.slice(1,-2) 
			}
			else if(before.slice(1).trim() && !after.slice(0,-1).trim()){
				insertText = ',' + eleString.slice(1,-2)
			}else if(after.slice(0,-1).trim()){
				insertText = eleString.slice(1,-2) + ','
			}
			editBuilder.insert(selection.start, insertText)
		});
	}

	addElements(elements: string): void {
		this.editor.edit(editBuilder => {
			let selection = this.editor.selection
			let eleString = jsonFormat(JSON.parse(elements))
			let insertText = ""
			let before = this.editor.document.getText(new vscode.Range(new vscode.Position(0, 0), selection.start)).trim()
			let after = this.editor.document.getText(new vscode.Range(selection.start, new vscode.Position(this.editor.document.lineCount, 0))).trim()

			if(!before && !after){
				//insert to blank file
				insertText = eleString
			}
			else if(!before.slice(1).trim() && !after.slice(0,-1).trim()){
				//insert to file with {}
				insertText = eleString.slice(1,-2) 
			}
			else if(before.slice(1).trim() && !after.slice(0,-1).trim()){
				insertText = ',' + eleString.slice(1,-2)
			}else if(after.slice(0,-1).trim()){
				insertText = eleString.slice(1,-2) + ','
			}
			editBuilder.insert(selection.start, insertText)
		});
	}

	private onActiveEditorChanged(): void {
		if (vscode.window.activeTextEditor) {
			if (vscode.window.activeTextEditor.document.uri.scheme === 'file' ) {
				const enabled = (vscode.window.activeTextEditor.document.languageId === 'json' 
						|| vscode.window.activeTextEditor.document.languageId === 'jsonc');
				vscode.commands.executeCommand('setContext', 'jsonOutlineEnabled', enabled);
				if (enabled) {
					this.refresh();
				}
			}
		} else {
			vscode.commands.executeCommand('setContext', 'jsonOutlineEnabled', false);
		}
	}

	private onDocumentChanged(changeEvent: vscode.TextDocumentChangeEvent): void {
		if (this.autoRefresh && changeEvent.document.uri.toString() === this.editor.document.uri.toString()) {
			for (const change of changeEvent.contentChanges) {
				const path = json.getLocation(this.text, this.editor.document.offsetAt(change.range.start)).path;
				path.pop();
				const node = path.length ? json.findNodeAtLocation(this.tree, path) : void 0;
				this.parseTree();
				this._onDidChangeTreeData.fire(node ? node.offset : void 0);
			}
		}
	}

	private parseTree(): void {
		this.text = '';
		this.tree = null;
		this.editor = vscode.window.activeTextEditor;
		if (this.editor && this.editor.document) {
			this.text = this.editor.document.getText();
			let jsonObj = json.parseTree(this.text);
			this.tree = jsonObj
		}
	}

	getChildren(offset?: number): Thenable<number[]> {
		if (offset) {
			const path = json.getLocation(this.text, offset).path;
			const node = json.findNodeAtLocation(this.tree, path);
			if(node.type == "object"){
				return Promise.resolve(this.getChildrenOffsets(node));
			}
			return Promise.resolve([])
		} else {
			return Promise.resolve(this.tree ? this.getChildrenOffsets(this.tree) : []);
		}
	}

	private getChildrenOffsets(node: json.Node): number[] {
		const offsets: number[] = [];
		for (const child of node.children) {
			const childPath = json.getLocation(this.text, child.offset).path;
			const childNode = json.findNodeAtLocation(this.tree, childPath);
			if (childNode) {
				offsets.push(childNode.offset);
			}
		}
		return offsets;
	}

	getTreeItem(offset: number): vscode.TreeItem {
		const path = json.getLocation(this.text, offset).path;
		const valueNode = json.findNodeAtLocation(this.tree, path);
		let label = path[path.length-1].toString()
		if(path.length>1){
			label = this.getLabel(valueNode)
		}
		if (valueNode) {
			const treeItem: vscode.TreeItem = new vscode.TreeItem(label, vscode.TreeItemCollapsibleState.Collapsed);
			treeItem.command = {
				command: 'extension.openJsonSelection',
				title: '',
				arguments: [new vscode.Range(this.editor.document.positionAt(valueNode.offset), this.editor.document.positionAt(valueNode.offset + valueNode.length))]
			};
			//treeItem.iconPath = this.getIcon(valueNode);
			treeItem.contextValue = path.length == 1 ? 'element' : valueNode.type;
			treeItem.collapsibleState = valueNode.type == "object" ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None
			return treeItem;
		}
		return null;
	}

	select(range: vscode.Range) {
		this.editor.selection = new vscode.Selection(range.start, range.end);
		this.editor.revealRange(range)
	}

	getSelectedText(): any {
		let selections = vscode.window.activeTextEditor.selections
		let textArr = []
		selections.forEach(selection => {
			let value = vscode.window.activeTextEditor.document.getText(selection).trim()
			if(value){
				textArr.push(value)
			}
		})
		return textArr.join('|')
	}

	private getLabel(node: json.Node): string {
		if (node.parent.type === 'array') {
			const prefix = node.parent.children.indexOf(node).toString();
			if (node.type === 'object') {
				return prefix + ':{ }';
			}
			if (node.type === 'array') {
				return prefix + ':[ ]';
			}
			return prefix + ':' + node.value.toString();
		}
		else {
			const property = node.parent.children[0].value.toString();
			if (node.type === 'array' || node.type === 'object') {
				if (node.type === 'object') {
					return '{ } ' + property;
				}
				if (node.type === 'array') {
					return '[ ] ' + property;
				}
			}
			const value = this.editor.document.getText(new vscode.Range(this.editor.document.positionAt(node.offset), this.editor.document.positionAt(node.offset + node.length)));
			return `${property}: ${value}`;
		}
	}
}