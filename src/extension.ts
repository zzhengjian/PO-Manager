'use strict';

import * as vscode from 'vscode';
import * as path from 'path';
import * as clipboardy from 'clipboardy';

import { JsonOutlineProvider } from './jsonOutline';
import {SelCommand} from './SelCommand'
import { Builder, By, Browser} from 'selenium-webdriver';
import { PageViewProvider } from './PageView';
import { DebuggerViewProvider } from './DebuggerViewProvider';


let driver = null, selCommand:SelCommand = null, server, extSocket
let browser = vscode.workspace.getConfiguration('browsers').get('browser')
vscode.commands.executeCommand('setContext', 'BrowserName', browser);
vscode.workspace.onDidChangeConfiguration(() => {
	browser = vscode.workspace.getConfiguration('browsers').get('browser');
	vscode.commands.executeCommand('setContext', 'BrowserName', browser);
});
export function activate(context: vscode.ExtensionContext) {
	const jsonOutlineProvider = new JsonOutlineProvider(context);
	vscode.window.registerTreeDataProvider('locators', jsonOutlineProvider);
	vscode.commands.registerCommand('locators.refresh', () => jsonOutlineProvider.refresh());
	vscode.commands.registerCommand('extension.openJsonSelection', range => jsonOutlineProvider.select(range));
	
	vscode.commands.registerCommand('pageView.startChrome', startDriver);
	vscode.commands.registerCommand('pageView.startFirefox', startDriver);
	vscode.commands.registerCommand('pageView.startEdge', startDriver);
	
	async function startDriver(){
		let started = false
		if(!driver){
			if(browser == "Chrome"){
				try {
					//driver = new Builder().forBrowser('chrome').build();
					const builder = new Builder().withCapabilities({
						browserName: 'chrome',
						'goog:chromeOptions': {
						// Don't set it to headless as extensions dont work in general
						// when used in headless mode
						args: [`load-extension=${path.join(__dirname + '../../build')}`],
						},
					})
					driver = await builder.build()
					started = true
					vscode.commands.executeCommand('setContext', 'ChromeEnabled', true);
				} catch (error) {
					vscode.window.showErrorMessage(error.message);
				}
			}
			else if(browser == "Firefox"){
				try {
					driver = await new Builder().forBrowser(Browser.FIREFOX).build();
					started = true
				} catch (error) {
					vscode.window.showErrorMessage(error.message);
				}
			}
			else if(browser == "Edge"){
				try {
					driver = await new Builder().forBrowser(Browser.EDGE).build();
					started = true
				} catch (error) {
					vscode.window.showErrorMessage(error.message);
				}
			}
			else if(browser == "IE"){
				try {
					driver = await new Builder().forBrowser(Browser.INTERNET_EXPLORER).build();
					await driver.manage().setTimeouts({implicit: 3})
					started = true
				} catch (error) {
					vscode.window.showErrorMessage(error.message);
				}
			}
			else if(browser == "Safari"){
				try {
					driver = await new Builder().forBrowser(Browser.SAFARI).build();
					started = true
				} catch (error) {
					vscode.window.showErrorMessage(error.message);
				}
			}
			if(started){
				selCommand = new SelCommand(driver);
				DebuggerViewProvider.selCommand = selCommand
				vscode.commands.executeCommand('setContext', 'WebdriverEnabled', true);
				jsonOutlineProvider.refresh()
			}
				
		}
		else{
			await selCommand.showBrowser()
		}
		
		
	}
	vscode.commands.registerCommand('pageView.stopDriver', async () => {
		try {
			await driver.quit()
		} catch (error) {
			vscode.window.showErrorMessage(error.message);
		}
		driver = null
		vscode.commands.executeCommand('setContext', 'WebdriverEnabled', false);
		vscode.commands.executeCommand('setContext', 'ChromeEnabled', false);
		jsonOutlineProvider.refresh()
	});


	vscode.commands.registerCommand('extension.highlight', async offset => {
		let locator = jsonOutlineProvider.getLocator(offset)	
		let text = await selCommand.highlight(locator)
		if(text) {
			vscode.window.showInformationMessage(text);
		}
	});

	vscode.commands.registerCommand('extension.isDisplayed', async offset => {
		let locator = jsonOutlineProvider.getLocator(offset)
		let text = await selCommand.isDisplayed(locator)
		vscode.window.showInformationMessage(text);
	});

	vscode.commands.registerCommand('extension.isEnabled', async offset => {
		let locator = jsonOutlineProvider.getLocator(offset)
		let text = await selCommand.isEnabled(locator)
		vscode.window.showInformationMessage(text);
	});

	vscode.commands.registerCommand('extension.isSelected', async offset => {
		let locator = jsonOutlineProvider.getLocator(offset)
		let text = await selCommand.isSelected(locator)
		vscode.window.showInformationMessage(text);
	});

	vscode.commands.registerCommand('extension.getText', async offset => {
		let locator = jsonOutlineProvider.getLocator(offset)
		let text = await selCommand.getText(locator)
		vscode.window.showInformationMessage(text);
	});

	vscode.commands.registerCommand('extension.getAttribute', async offset => {
		let locator = jsonOutlineProvider.getLocator(offset)
		let text = await selCommand.getAttribute(locator)
		vscode.window.showInformationMessage(text);
	});

	vscode.commands.registerCommand('extension.getCssValue', async offset => {
		let locator = jsonOutlineProvider.getLocator(offset)
		let text = await selCommand.getCssValue(locator)
		vscode.window.showInformationMessage(text);
	});

	vscode.commands.registerCommand('extension.getElementInfo', async offset => {
		let locator = jsonOutlineProvider.getLocator(offset)
		let text = await selCommand.getElementInfo(locator)
		vscode.window.showInformationMessage(text);
	});
	vscode.commands.registerCommand('extension.hideElement', async offset => {
		let locator = jsonOutlineProvider.getLocator(offset)
		let text = await selCommand.hideElement(locator)
		vscode.window.showInformationMessage(text);
	});
	vscode.commands.registerCommand('extension.showElement', async offset => {
		let locator = jsonOutlineProvider.getLocator(offset)
		let text = await selCommand.showElement(locator)
		vscode.window.showInformationMessage(text);
	});
	vscode.commands.registerCommand('extension.click', async offset => {
		let locator = jsonOutlineProvider.getLocator(offset)
		let text = await selCommand.click(locator)
		vscode.window.showInformationMessage(text);
	});
	vscode.commands.registerCommand('extension.jsClick', async offset => {
		let locator = jsonOutlineProvider.getLocator(offset)
		let text = await selCommand.jsClick(locator)
		vscode.window.showInformationMessage(text);
	});
	vscode.commands.registerCommand('extension.clear', async offset => {
		let locator = jsonOutlineProvider.getLocator(offset)
		let text = await selCommand.clear(locator)
		vscode.window.showInformationMessage(text);
	});
	vscode.commands.registerCommand('extension.sendKeys',  async offset => {
		let locator = jsonOutlineProvider.getLocator(offset)
		let text = await selCommand.sendKeys(locator)
		vscode.window.showInformationMessage(text);
	});

	vscode.commands.registerCommand('extension.hover', async offset => {
		let locator = jsonOutlineProvider.getLocator(offset)
		let text = await selCommand.hover(locator)
		vscode.window.showInformationMessage(text);
	});
	vscode.commands.registerCommand('extension.jsHover', async offset => {
		let locator = jsonOutlineProvider.getLocator(offset)
		let text = await selCommand.jsHover(locator)
		vscode.window.showInformationMessage(text);
	});

	vscode.commands.registerCommand('extension.updateElement', async offset => {

		let locator = await selCommand.selectElement()
		jsonOutlineProvider.updateLocator(locator, offset)
	});

	vscode.commands.registerCommand('extension.generateElement', async () => {
		let jsonElement = await selCommand.generateElement()
		jsonOutlineProvider.addElement(jsonElement)
	});

	vscode.commands.registerCommand('extension.generateElements', async () => {
		let jsonElements = await selCommand.generateElements()
		jsonOutlineProvider.addElements(jsonElements)
	});

	vscode.commands.registerCommand('extension.generateAllElements', async () => {
		let jsonElements = await selCommand.generateAllElements()
		jsonOutlineProvider.addElements(jsonElements)
	});

	vscode.commands.registerCommand('extension.getCurrentUrl', async () => {
		let text = await selCommand.getCurrentUrl()
		vscode.window.showInformationMessage(text);
	});
	vscode.commands.registerCommand('extension.runBatchScript',  async () => {
		await selCommand.runJsScript()
	});
	vscode.commands.registerCommand('extension.closeTab',  async () => {
		await selCommand.closeTab()
	});
	vscode.commands.registerCommand('extension.switchToMainTab',  async () => {
		await selCommand.switchToMainTab()
	});
	vscode.commands.registerCommand('extension.switchToNextTab',  async () => {
		await selCommand.switchToNextTab()
	});
	vscode.commands.registerCommand('extension.switchToFrame',  async () => {
		let text = await selCommand.switchToFrame()
		vscode.window.showInformationMessage(text);
	});

	vscode.commands.registerCommand('extension.switchToParentFrame',  async () => {
		let text = await selCommand.switchToParentFrame()
		vscode.window.showInformationMessage(text);
	});

	vscode.commands.registerCommand('extension.switchToDefaultContent',  async () => {
		let text = await selCommand.switchToDefaultContent()
		vscode.window.showInformationMessage(text);
	});
	
	const pageViewProvider = new PageViewProvider(context);
	vscode.window.registerTreeDataProvider('pageView', pageViewProvider);
	vscode.commands.registerCommand('pageView.highlight', async node => {
		let text = await selCommand.highlight(node.item)
		if(text) {
			vscode.window.showInformationMessage(text);
		}
	});

	vscode.commands.registerCommand('pageView.copy', async node => {
		clipboardy.writeSync(node.viewPath)
	});

	vscode.commands.registerCommand('pageView.codeGen', async viewPath => {
		vscode.window.activeTextEditor.insertSnippet(new vscode.SnippetString(viewPath))
	});

	vscode.commands.registerCommand('pageView.openFile', async node => {
		vscode.window.showTextDocument(vscode.Uri.file(path.join(pageViewProvider.locatorDir, node.viewPath.replace(/\./, '/') + '.json')))
	});

	vscode.commands.registerCommand('pageView.refresh', () => pageViewProvider.refresh());

	const webViewProvider = new DebuggerViewProvider(context.extensionUri);
	vscode.window.registerWebviewViewProvider(DebuggerViewProvider.viewType, webViewProvider);
	vscode.commands.registerCommand('debugView.isDisplayed', async () => {
		let locator = webViewProvider.getLocator()
		let text = await selCommand.isDisplayed(locator)
		vscode.window.showInformationMessage(text);
	});

	vscode.commands.registerCommand('debugView.isEnabled', async () => {
		let locator = webViewProvider.getLocator()
		let text = await selCommand.isEnabled(locator)
		vscode.window.showInformationMessage(text);
	});

	vscode.commands.registerCommand('debugView.isSelected', async () => {
		let locator = webViewProvider.getLocator()
		let text = await selCommand.isSelected(locator)
		vscode.window.showInformationMessage(text);
	});

	vscode.commands.registerCommand('debugView.getText', async () => {
		let locator = webViewProvider.getLocator()
		let text = await selCommand.getText(locator)
		vscode.window.showInformationMessage(text);
	});

	vscode.commands.registerCommand('debugView.getAttribute', async () => {
		let locator = webViewProvider.getLocator()
		let text = await selCommand.getAttribute(locator)
		vscode.window.showInformationMessage(text);
	});

	vscode.commands.registerCommand('debugView.getCssValue', async () => {
		let locator = webViewProvider.getLocator()
		let text = await selCommand.getCssValue(locator)
		vscode.window.showInformationMessage(text);
	});

	vscode.commands.registerCommand('debugView.getElementInfo', async () => {
		let locator = webViewProvider.getLocator()
		let text = await selCommand.getElementInfo(locator)
		vscode.window.showInformationMessage(text);
	});
	vscode.commands.registerCommand('debugView.hideElement', async () => {
		let locator = webViewProvider.getLocator()
		let text = await selCommand.hideElement(locator)
		vscode.window.showInformationMessage(text);
	});
	vscode.commands.registerCommand('debugView.showElement', async () => {
		let locator = webViewProvider.getLocator()
		let text = await selCommand.showElement(locator)
		vscode.window.showInformationMessage(text);
	});
	vscode.commands.registerCommand('debugView.click', async () => {
		let locator = webViewProvider.getLocator()
		let text = await selCommand.click(locator)
		vscode.window.showInformationMessage(text);
	});
	vscode.commands.registerCommand('debugView.jsClick', async () => {
		let locator = webViewProvider.getLocator()
		let text = await selCommand.jsClick(locator)
		vscode.window.showInformationMessage(text);
	});
	vscode.commands.registerCommand('debugView.clear', async () => {
		let locator = webViewProvider.getLocator()
		let text = await selCommand.clear(locator)
		vscode.window.showInformationMessage(text);
	});
	vscode.commands.registerCommand('debugView.sendKeys',  async () => {
		let locator = webViewProvider.getLocator()
		let text = await selCommand.sendKeys(locator)
		vscode.window.showInformationMessage(text);
	});

	vscode.commands.registerCommand('debugView.hover', async () => {
		let locator = webViewProvider.getLocator()
		let text = await selCommand.hover(locator)
		vscode.window.showInformationMessage(text);
	});
	vscode.commands.registerCommand('debugView.jsHover', async () => {
		let locator = webViewProvider.getLocator()
		let text = await selCommand.jsHover(locator)
		vscode.window.showInformationMessage(text);
	});
}