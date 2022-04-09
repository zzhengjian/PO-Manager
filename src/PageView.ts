import * as vscode from 'vscode';
var glob = require("glob");
var shush = require('shush');
import * as fs from 'fs';
import * as path from 'path';

export class PageViewProvider implements vscode.TreeDataProvider<View> {

	private _onDidChangeTreeData: vscode.EventEmitter<View | null> = new vscode.EventEmitter<View | null>();
	readonly onDidChangeTreeData: vscode.Event<View | null> = this._onDidChangeTreeData.event;
	private views: any;
	public  locatorDir = path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, vscode.workspace.getConfiguration('pageView').get('locatorFolder'))
	public  elementCommands: string[] = vscode.workspace.getConfiguration('pageView').get('elementCommands')
	public  elementNameResolver: string = vscode.workspace.getConfiguration('pageView').get('elementNameResolver')
	
	constructor(private context: vscode.ExtensionContext) {
		this.views = this.getViews();
		vscode.workspace.onDidChangeConfiguration(() => {
			this.locatorDir = path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, vscode.workspace.getConfiguration('pageView').get('locatorFolder'))
			this.elementCommands = vscode.workspace.getConfiguration('pageView').get('elementCommands')
			this.elementNameResolver = vscode.workspace.getConfiguration('pageView').get('elementNameResolver')
			this.refresh()
		});
	}

	private getViews(){
		let views = {}
		
		let files = glob.sync("**/*.json", {cwd: this.locatorDir})
		console.log('going to process the following json into views', files);
		for(let file of files) {
			let view = shush(path.resolve(this.locatorDir, file));
			var viewPathArray = file.split('/');
			viewPathArray[viewPathArray.length - 1] = viewPathArray[viewPathArray.length - 1].split('.json')[0];
			let viewNS = views
			for (var i = 0; i < viewPathArray.length - 1; i++) {
				viewNS[viewPathArray[i]] = (viewNS[viewPathArray[i]]) ? viewNS[viewPathArray[i]] : {};
				viewNS = viewNS[viewPathArray[i]];
				
			}
			viewNS[viewPathArray[viewPathArray.length - 1]] = view
		}
		return views
	}

	refresh(){
		this.views = this.getViews()
		this._onDidChangeTreeData.fire(undefined);
	}

	getChildren(node?: View): Thenable<View[]> {
		if(node){
			if(node.contextValue == 'element'){
				let elementCommands = []
				elementCommands = this.elementCommands
				if(!elementCommands || elementCommands.length<=0){
					elementCommands = [
						"{element}By()",
						"await {element}Wait()\n",
						"await {element}Visible()\n",
						"await {element}Present()\n",
						"await {element}WaitVisible()\n",
						"await {element}().click()\n",
						"await {element}().getText()\n",
						"await {element}().sendKeys('default value')\n",
						"await {element}TextEquals('default value')\n",
						"await {element}AttrEquals('attribute','default value')\n"
					]
				}
				let elementNameResolver = this.elementNameResolver
				if(!elementNameResolver){
					elementNameResolver = 'elementPath'
				}
				let resolver = new Function("elementPath", "return " + elementNameResolver) 
				let children = elementCommands.map(command => {
					let label = command.replace(/\{element\}/, resolver(node.viewPath))
					let view = new View(label, null, label, vscode.TreeItemCollapsibleState.None)
					if(this.pathExists(path.join(this.locatorDir, view.viewPath.replace(/\./, '/') + '.json'))){
						view.contextValue = 'file'
					}
					return view
				})
				return Promise.resolve(children);
			}
			else{
				let items = Object.keys(node.item).map(key => {
					let view = new View(key, node.item[key], node.viewPath + '.' + key ,vscode.TreeItemCollapsibleState.Collapsed)
					if(this.pathExists(path.join(this.locatorDir, view.viewPath.replace(/\./, '/') + '.json'))){
						view.contextValue = 'file'
					}
					
					if(node.contextValue == 'file'){
						view.contextValue = 'element'
						view.iconPath = {
							light: this.context.asAbsolutePath(path.join('resources', 'light', 'element.png')),
							dark: this.context.asAbsolutePath(path.join('resources', 'dark', 'element.png'))
						}
					}
					
					return view
				})
				return Promise.resolve(items);
			}
		}
		else{
			let items = Object.keys(this.views).map(key => {
				let view = new View(key, this.views[key], key ,vscode.TreeItemCollapsibleState.Collapsed)
				if(this.pathExists(path.join(this.locatorDir, view.viewPath.replace(/\./, '/') + '.json'))){
					view.contextValue = 'file'
				}
				return view
			})
			return Promise.resolve(items);
		}
		
	}


	getTreeItem(node: View): vscode.TreeItem {
		if(!node.item){
			node.command = {
				command: 'pageView.codeGen',
				title: '',
				arguments: [node.viewPath]
			};
		}
		return node
	}

	private pathExists(p: string): boolean {
		try {
			fs.accessSync(p);
		} catch (err) {
			return false;
		}

		return true;
	}
	
}

class View extends vscode.TreeItem {
	constructor(
	  public readonly label: string,
	  public readonly item: JSON,
	  public readonly viewPath: string,
	  public readonly collapsibleState: vscode.TreeItemCollapsibleState
	) {
	  super(label, collapsibleState);
	}
}

  