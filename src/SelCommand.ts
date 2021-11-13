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

	setParent(value: string): void {
		this.parentLocator = value
	}

	getParent(): string {
		return this.parentLocator
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
		try {
			let handles = await this.driver.getAllWindowHandles();
			try {
				let handle = await this.driver.getWindowHandle();
				let inTop = await this.driver.executeScript("return window == window.top")
				if(inTop) await this.driver.switchTo().window(handle)
			} catch (error) {
				await this.driver.switchTo().window(handles[0])
			}
		}
		catch {
			vscode.window.showErrorMessage("browser is closed unexpectedly, please reopen the browser")
		}
	}

	async switchToMainTab(): Promise<string> {
		let handles = await this.driver.getAllWindowHandles();
		await this.driver.switchTo().window(handles[0])
		return `switch to url: `+ await this.driver.getCurrentUrl()
	}

	async switchToFrame(): Promise<string> {
		let frameText = await vscode.window.showInputBox({ placeHolder: 'Enter frameId or css selector ' })
		.then(async FrameId => {
			let attrjs = `var attrs = [];
					var el = window.frameElement;
					for (var i = 0, atts = el.attributes, n = atts.length, arr = []; i < n; i++){
						attrs.push(atts[i].nodeName + ': ' + atts[i].nodeValue)
					}
					return attrs.toLocaleString();`; 
			if(typeof FrameId == 'number'){
				await this.driver.switchTo().frame(FrameId) 
			}
			else{
				let frame = await this.driver.findElement(By['css'](FrameId))
				await this.driver.switchTo().frame(frame)
			}
			return await this.driver.executeScript(attrjs) 
			
		})

		return "switch to frame: " + frameText
	}

	async switchToDefaultContent(): Promise<string> {
		await this.driver.switchTo().defaultContent()
		return "switch to default content"
	}

	async switchToParentFrame(): Promise<string> {
		await this.driver.switchTo().parentFrame()
		return "switch to parentFrame"
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

	async getAttribute(locator: string): Promise<string> {
		let ele = await this.find(locator)
		let text = await vscode.window.showInputBox({ placeHolder: 'Enter Value' })
		.then(async attr => {
			let attrValue = await ele.getAttribute(attr)
			return attr + ': ' + attrValue
		})
		return `getAttribute of ` + text
	}

	async getCssValue(locator: string): Promise<string> {
		let ele = await this.find(locator)
		let text = await vscode.window.showInputBox({ placeHolder: 'Enter Value' })
		.then(async cssStyleProperty => {
			let cssValue = await ele.getCssValue(cssStyleProperty)
			return cssStyleProperty + ': ' + cssValue
		})
		return `getCssValue of ` + text
	}

	async sendKeys(locator: string): Promise<string> {
		let text = await vscode.window.showInputBox({ placeHolder: 'Enter Value' })
		.then(async value => {
			await this.showBrowser()
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
		await this.showBrowser()
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
		await this.showBrowser()
		await this.driver.executeScript("return arguments[0].click();", ele)
		return "click on: " + this.getBy(locator)
	}

	async clear(locator: string): Promise<string>  {
		let ele = await this.find(locator)
		await this.showBrowser()
		await ele.clear()
		return "clear for: " + this.getBy(locator)
	}

	async showElement(locator: string): Promise<string>  {
		let ele = await this.find(locator)
		try {
			await this.driver.executeScript("$(arguments[0]).show();", ele)
			return "show element for: "+ this.getBy(locator)
		} catch (error) {
			return error.message
		}
	}

	async hideElement(locator: string): Promise<string>  {
		let ele = await this.find(locator)
		try {
			await this.driver.executeScript("$(arguments[0]).hide();", ele)
			return "hide element for: "+ this.getBy(locator)
		} catch (error) {
			return error.message
		}
		

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
		await this.showBrowser()
		let ele = await this.find(locator)
		await this.driver.actions().mouseMove(ele).perform()
		return "hover on element for: "+ this.getBy(locator)
	}

	async jsHover(locator: string): Promise<string>  {
		await this.showBrowser()
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

	async highlight(locator: any, isParent?: boolean): Promise<string> {
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
		try {
			let by = this.getBy(locator)
			let eleList = null; 
			if(isParent){
				eleList = await this.driver.findElements(by)
			}
			else if(this.parentLocator){
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
			let scrollJs = `if(arguments[0].scrollIntoViewIfNeeded){
				arguments[0].scrollIntoViewIfNeeded(true)
			}
			else{
				arguments[0].scrollIntoView()
			}`
			await this.driver.executeScript(scrollJs, ele)
			for(let i=0; i<3; i++){
				_flasher = await this.driver.executeScript(js, ele);
				await this.driver.sleep(300)
				_flasher = await this.driver.executeScript(revertJs, ele);
				await this.driver.sleep(300)
			}
		} catch (error) {
			return error.message
		}
		return `Highlighting Element: `+ this.getBy(locator)
	}
	

	async find(locator: string): WebElement {
		if(!this.parentLocator){
			return this.driver.findElement(this.getBy(locator))
		}
		return this.driver.findElement(this.getBy(this.parentLocator)).findElement(this.getBy(locator))
	}

	getBy(locator: any): string {
		if(typeof locator == "string" && locator.match(/^([A-Za-z]+)=.+/)){
			let locatorObj = this.parse_locator(locator)
			return By[locatorObj.type](locatorObj.locator)
		}
		if(typeof locator == "string"){
			return By['css'](locator)
		}
		return By[locator.type](locator.locator)
	}


	parse_locator(locator) {
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