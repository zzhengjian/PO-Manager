import { Builder, By, WebDriver, WebElement} from 'selenium-webdriver';
import * as vscode from 'vscode';

export class SelCommand {

	private driver: WebDriver;
	private parentLocator: string;
	private pascalCase: any;
	private preserveConsecutiveUppercase: any;
	
	constructor(driver: WebDriver) {
		this.driver = driver
		this.parentLocator = ""
		this.pascalCase = vscode.workspace.getConfiguration('jsonOutline').get('pascalCase')
		this.preserveConsecutiveUppercase = vscode.workspace.getConfiguration('jsonOutline').get('preserveConsecutiveUppercase')
		vscode.workspace.onDidChangeConfiguration(() => {
			this.pascalCase = vscode.workspace.getConfiguration('jsonOutline').get('pascalCase');
			this.preserveConsecutiveUppercase = vscode.workspace.getConfiguration('jsonOutline').get('preserveConsecutiveUppercase')
		});
	}

	setParentLocator(): void {
		vscode.window.showInputBox({ placeHolder: 'Enter Parent Locator' })
		.then(value => {
			this.parentLocator = value
			vscode.window.showInformationMessage(this.parentLocator);
		})
	}
	clearParentLocator(): void {
		this.parentLocator = ""
		vscode.window.showInformationMessage("parent locator: " + this.parentLocator);
	}

	async getCurrentUrl(): Promise<string> {
		let text = await this.driver.getCurrentUrl()
		return `url: ` + text
	}

	async closeTab(): Promise<string> {
		await this.driver.close()
		return `close tab` 
	}

	async showBrowser(): Promise<void> {
		let handle = await this.driver.getWindowHandle();
		await this.driver.switchTo().window(handle)
	}

	async switchToMainTab(): Promise<string> {
		let handles = await this.driver.getAllWindowHandles();
		await this.driver.switchTo().window(handles[0])
		return `switch to url: `+ await this.driver.getCurrentUrl()
	}

	async switchToNextTab(): Promise<string> {
		let curHandle = await this.driver.getWindowHandle()
		let handles = await this.driver.getAllWindowHandles();
		let index = handles.indexOf(curHandle)
		await this.driver.switchTo().window(handles[index+1])
		return `switch to url: `+ await this.driver.getCurrentUrl()
	}

	async getText(locator: string): Promise<string> {
		let ele = await this.find(locator)
		return ele.getText()
	}

	async sendKeys(locator: string): Promise<string> {
		let text = await vscode.window.showInputBox({ placeHolder: 'Enter Value' })
		.then(async value => {
			let ele = await this.find(locator)
			await ele.sendKeys(value)
			return value
		})
		return `sending value: ` + text
	}

	async isDisplayed(locator: string): Promise<string>  {
		let ele = await this.find(locator)
		let value = await ele.isDisplayed()
		return "isDisplayed: " + value
	}

	async isEnabled(locator: string): Promise<string>  {
		let ele = await this.find(locator)
		let value = await ele.isEnabled()
		return "isEnabled: " + value
	}

	async isSelected(locator: string): Promise<string>  {
		let ele = await this.find(locator)
		let value = await ele.isSelected()
		return "isSelected: " + value
	}

	async click(locator: string): Promise<string>  {
		let ele = await this.find(locator)
		try {
			await ele.click()
			return "click on: " + this.getBy(locator)
		} catch (error) {
			return error.message
		}
	}

	async jsClick(locator: string): Promise<string>  {
		let ele = await this.find(locator)
		await this.driver.executeScript("return arguments[0].click();", ele)
		return "click on: " + this.getBy(locator)
	}

	async clear(locator: string): Promise<string>  {
		let ele = await this.find(locator)
		await ele.clear()
		return "clear for: " + this.getBy(locator)
	}

	async showElement(locator: string): Promise<string>  {
		let ele = await this.find(locator)
		await this.driver.executeScript("return $(arguments[0]).show();", ele)
		return "show element for: "+ this.getBy(locator)
	}

	async hideElement(locator: string): Promise<string>  {
		let ele = await this.find(locator)
		await this.driver.executeScript("return $(arguments[0]).hide();", ele)
		return "hide element for: "+ this.getBy(locator)

	}

	private setNameBuilderOptions(options): Promise<string>  {
		return this.driver.executeScript(`window.__side.setBuilderOptions(arguments[0]);`, options)
	}

	async selectElement(): Promise<string>  {
		await this.showBrowser()
		return this.driver.executeAsyncScript(`var callback = arguments[arguments.length - 1]; 
												window.__side.selectElement(callback);`)
					.then(value => {
						return value
					})
	}

	async generateElement(): Promise<string>  {
		await this.showBrowser()
		let options = {pascalCase: this.pascalCase, preserveConsecutiveUppercase: this.preserveConsecutiveUppercase}
		return this.driver.executeAsyncScript(`var callback = arguments[arguments.length - 1]; 
												window.__side.generateElement(callback, arguments[0]);`, options)
					.then(value => {
						return value
					})
	}

	async generateElements(): Promise<string>  {
		await this.showBrowser()
		let options = {pascalCase: this.pascalCase, preserveConsecutiveUppercase: this.preserveConsecutiveUppercase}
		return this.driver.executeAsyncScript(`var callback = arguments[arguments.length - 1]; 
												window.__side.generateElements(callback, arguments[0]);`, options)
					.then(value => {
						return value
					})
	}

	async generateAllElements(): Promise<string>  {
		let options = {pascalCase: this.pascalCase, preserveConsecutiveUppercase: this.preserveConsecutiveUppercase}
		return this.driver.executeAsyncScript(`var callback = arguments[arguments.length - 1]; 
												window.__side.generateAllElements(callback, arguments[0]);`, options)
					.then(value => {
						return value
					})
	}

	async hover(locator: string): Promise<string>  {
		let ele = await this.find(locator)
		await this.driver.actions().mouseMove(ele).perform()
		return "hover on element for: "+ this.getBy(locator)
	}

	async jsHover(locator: string): Promise<string>  {
		let ele = await this.find(locator)
		let hoverJs =  "if(document.createEvent){var evObj = document.createEvent('MouseEvents');evObj.initEvent('mouseover', true, false); arguments[0].dispatchEvent(evObj);} else if(document.createEventObject) { arguments[0].fireEvent('onmouseover');}";
		await this.driver.executeScript(hoverJs, ele)
		return "using js hover on element for: "+ this.getBy(locator)
	}

	async getElementInfo(locator: string): Promise<string>  {
		let eleInfo = ""
		let js = `var attrs = [];
					var el = arguments[0];
					for (var i = 0, atts = el.attributes, n = atts.length, arr = []; i < n; i++){
						attrs.push(atts[i].nodeName + ': ' + atts[i].nodeValue)
					}
					return attrs;`; 
		let ele = await this.find(locator)
		eleInfo += "isDisplayed: " + await ele.isDisplayed() + "\n"
		eleInfo += "isEnabled: " + await ele.isEnabled() + "\n"
		eleInfo += "isSelected: " + await ele.isSelected() + "\n"
		eleInfo += "Text: " + await ele.getText() + "\n"
		let attrs = await this.driver.executeScript(js, ele);
		for(let attr of attrs){
			eleInfo += attr + "\n"
		}
		return eleInfo
	}

	async runJsScript(): Promise<string> {
		const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor
		let commands = await vscode.window.showInputBox({ placeHolder: 'Enter Script' })
		.then(async scripts => {
			return new AsyncFunction('driver', scripts) 
		})     
        return commands(this.driver)
	}

	async highlight(locator: any): Promise<string> {
		let _flasher = ["",""]

		let js = `var flasher = [];
					flasher[0] = arguments[0].style.outline;
					flasher[1] = arguments[0].style.background;
					arguments[0].style.outline='3px solid red';
					arguments[0].style.background = 'yellow';
					return flasher;`;
		
		let revertJs = `var flasher = [];
						flasher[0] = arguments[0].style.outline;
						flasher[1] = arguments[0].style.background;
						arguments[0].style.outline='${_flasher[0]}';
						arguments[0].style.background = '${_flasher[1]}';
						return flasher;`
		let by = this.getBy(locator)
		let eleList = null; 
		if(this.parentLocator){
			eleList = await this.driver.findElement(this.getBy(this.parentLocator)).findElements(by)
		}
		else{
			eleList = await this.driver.findElements(by)
		}

		if(eleList.length == 0){
			return "NoSuchElement with Locator: " + this.getBy(locator)
		}
		let ele = eleList[0]
		if(!await ele.isDisplayed()){
			return "Element is invisible"
		}

		await this.showBrowser()
		//scroll into view
		await this.driver.executeScript('arguments[0].scrollIntoViewIfNeeded(true)', ele)
		for(let i=0; i<3; i++){
			_flasher = await this.driver.executeScript(js, ele);
			await this.driver.sleep(300)
			_flasher = await this.driver.executeScript(revertJs, ele);
			await this.driver.sleep(300)
		}
		return `Highlighting Element: `+ this.getBy(locator)
	}
	

	async find(locator: string): WebElement {
		await this.showBrowser()
		if(!this.parentLocator){
			return this.driver.findElement(this.getBy(locator))
		}
		return this.driver.findElement(this.getBy(this.parentLocator)).findElement(this.getBy(locator))
	}

	getBy(locator: any): string {
		if(typeof locator == "string"){
			return By['css'](locator)
		}
		return By[locator.type](locator.locator)
	}

}