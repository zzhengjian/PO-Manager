
# Why PO-Manager are useful?
PO-Manager provides the capability to recognize webelements and convert them to the page objects and act on it.
It can save tons of effect to create/maintain your locator files and also speed up your automation.

## Installation: 
Search PO-Manager in vscode Extenstion Marketplace and install it.

![VsCode-Extension](https://github.com/zzhengjian/PO-Manager/blob/main/docs/VsCode-Extension.png)

## Prerequisite: 
Get Chrome installed and chromedriver located in the PATH
- Open the terminal and run chromedriver to check if chromedriver works good.

![chromedriver](https://github.com/zzhengjian/PO-Manager/blob/main/docs/chromedriver.png)

-Before interact with the browser, you need to start a webdriver browser session.

![StartBrowser](https://github.com/zzhengjian/PO-Manager/blob/main/docs/StartBrowser.gif)

# Add and Update Elements
Now identifying elements in web page and writing xpath became easy by using Add Element and Update Element function.

## Add Element : 
Go to the particular locator.json file or create a new file and right click on the file, click on Add Element and select the element in the UI. The element object is getting generated automatically in .json file.

![AddElement](https://github.com/zzhengjian/PO-Manager/blob/main/docs/AddElement.gif)

## Add Elements : 
It is same as Add Element but here we can select multiple elements at once by selecting a area of the elements in UI. 

![AddElements](https://github.com/zzhengjian/PO-Manager/blob/main/docs/AddElements.gif)

## Update Element:
If the locator path is updated in html by developer. The element can’t be identified by highlighting it then we need to update the element path in locator file. Here is the solution for this.
Right click on the element and click update element and select the element which need to be updated

![UpdateLocator](https://github.com/zzhengjian/PO-Manager/blob/main/docs/UpdateLocator.gif)


Whenever new locators are added to .json file refresh the LOCATORS. The newly added locator will be displayed in LOCATORS list
Highlight Element : Whenever element is visible and exists user can highlight the element.
![Highlights](https://github.com/zzhengjian/PO-Manager/blob/main/docs/HighlightElement.gif)


## Debug with the elements:
There are multiple functions as listed below when user right click on the element object
 E.g : 
  *	Clear
  *	Click
  * getText
  * sendKey etc

This will call original selenium commands and you can use this to check if selenium actions work for the defined element.

# PAGE VIEW:
   Also it provide a PAGE VIEWS in the left explorer panel. The view will load all the page-object files for you to navigate through them quickly.
  * ps: please go to vscode setting -> Extentions -> PO-Manager and update the Locator Folder value to your project folder which save all the locators.

![PageViews](https://github.com/zzhengjian/PO-Manager/blob/main/docs/PageViews.gif)
   



