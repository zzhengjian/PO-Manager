'use strict';

import * as vscode from 'vscode';
import * as path from 'path';

import { JsonOutlineProvider } from './jsonOutline';
import {SelCommand} from './SelCommand'
import { Builder, By} from 'selenium-webdriver';
import { PageViewProvider } from './PageView';
const open = require('open');
const open_darwin = require('mac-open');

// decide what os should be used
// possible node values 'darwin', 'freebsd', 'linux', 'sunos' or 'win32'
const platform = process.platform;

// open file in custom browser
function openInSpecificPlatform(e: string, op: any, customBrowser: string) {
    customBrowser ? op(e, customBrowser) : op(e);
}

// common function for file opening
function openFile(url: string, customBrowser: string) {
    // check if it is html file
	if (platform === 'darwin') {
		openInSpecificPlatform(url, open_darwin, customBrowser);
	}
	else {
		openInSpecificPlatform(url, open, customBrowser);
	}
}

let driver = null, selCommand = null
export function activate(context: vscode.ExtensionContext) {

	const jsonOutlineProvider = new JsonOutlineProvider(context);
	vscode.window.registerTreeDataProvider('jsonOutline', jsonOutlineProvider);
	vscode.commands.registerCommand('jsonOutline.refresh', () => jsonOutlineProvider.refresh());
	vscode.commands.registerCommand('extension.openJsonSelection', range => jsonOutlineProvider.select(range));
	
	vscode.commands.registerCommand('pageView.startDriver', async () => {
		if(!driver){
			//driver = new Builder().forBrowser('chrome').build();
			const builder = new Builder().withCapabilities({
				browserName: 'chrome',
				// vendor prefix required as of ChromeDriver 75
				// https://groups.google.com/d/msg/chromedriver-users/ZnGlzYfsgt4/IbEHKSW8AQAJ
				'goog:chromeOptions': {
				  // Don't set it to headless as extensions dont work in general
				  // when used in headless mode
				  // https://pptr.dev/#?product=Puppeteer&version=v1.12.2&show=api-working-with-chrome-extensions
				  // in production it really doesn't matter as recording in headless mode doesn't make sense
				  args: [`load-extension=${path.join(__dirname + '../../build')}`],
				},
			  })
			driver = await builder.build()
			selCommand = new SelCommand(driver);
			vscode.commands.executeCommand('setContext', 'WebdriverEnabled', true);
			jsonOutlineProvider.refresh()
		}
		else{
			await driver.quit()
			driver = null
			vscode.commands.executeCommand('setContext', 'WebdriverEnabled', false);
			jsonOutlineProvider.refresh()
		}
		
		
	});
	vscode.commands.registerCommand('extension.stopDriver', async () => {
		await driver.quit()
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
		jsonOutlineProvider.updateLocator(locator)
	});

	vscode.commands.registerCommand('extension.generateElement', async offset => {
		let jsonElement = await selCommand.generateElement()
		jsonOutlineProvider.addElement(jsonElement)
	});

	vscode.commands.registerCommand('extension.generateElements', async offset => {
		let jsonElements = await selCommand.generateElements()
		jsonOutlineProvider.addElements(jsonElements)
	});

	vscode.commands.registerCommand('extension.getCurrentUrl', async () => {
		let text = await selCommand.getCurrentUrl()
		vscode.window.showInformationMessage(text);
	});
	vscode.commands.registerCommand('extension.runBatchScript',  async () => {
		await selCommand.runJsScript()
	});
	vscode.commands.registerCommand('extension.setParentLocator',  async () => {
		selCommand.setParentLocator()
	});
	vscode.commands.registerCommand('extension.clearParentLocator',  async () => {
		selCommand.clearParentLocator()
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
	
	const pageViewProvider = new PageViewProvider(context);
	vscode.window.registerTreeDataProvider('pageView', pageViewProvider);
	vscode.commands.registerCommand('pageView.highlight', async node => {
		let text = await selCommand.highlight(node.item['locator'])
		if(text) {
			vscode.window.showInformationMessage(text);
		}
	});

	vscode.commands.registerCommand('pageView.codeGen', async viewPath => {
		vscode.window.activeTextEditor.insertSnippet(new vscode.SnippetString(viewPath))
	});

	vscode.commands.registerCommand('pageView.openFile', async node => {
		vscode.window.showTextDocument(vscode.Uri.file(path.join(pageViewProvider.locatorDir, node.viewPath.replace(/\./, '/') + '.json')))
	});

	vscode.commands.registerCommand('pageView.refresh', () => pageViewProvider.refresh());

}