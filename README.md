# Basic Information : 
## How to install Nemo-Locator-Helper in VsCode

### Installation: 
1. Launch a automation project and you can see PAGE VIEWS in the left explorer panel. 
   -if not, please go to vscode setting -> Extentions -> JSON Locator File and update the Locator Folder value.
   

2. You either open a locator file directly or open it through the PAGE VIEWS, and then see a LOCATORS VIEW in the left explorer panel.


# Why VSCODE Extensions are useful?
Extensions to your IDE are invaluable to speed up your work without reducing the quality of your output.

# Add and Update Elements
Now identifying elements in web page and writing xpath became easy by using Add Element and Update Element function.

## Add Element : 
Open the browser by hitting a browser icon and open the application. Go to the particular locator.json file or create a new file and right click on the file, click on Add Element and select the element in the UI. The element xpath is getting generated automatically in .json file.
![AddElement](https://github.com/zzhengjian/PO-Manager/blob/main/docs/AddElement.gif)

## Add Elements : 
It is same as Add Element but here we can select multiple elements at once by selecting a area of the elements in UI. 
![AddElements](https://github.com/zzhengjian/PO-Manager/blob/main/docs/AddElements.gif)

## Update Element:
If the locator path is updated in html by developer. The element can’t be identified by highlighting it then we need to update the element path in locator file. Here is the solution for this.
Right click on the element and click update element and select the element which need to be updated

![UpdateLocator](https://github.com/zzhengjian/PO-Manager/blob/main/docs/UpdateLocator.gif)

# NEMO/PAGE VIEW:
To auto generate a code we make use of Nemo view.
All the locators are loaded in nemo view.
e.g:  If we want to generate a code to click a particular element. Go to the json file where the code should be written then Go to nemo view, go to the locator element select click method. The code automatically generate in json file.
Just we need to add a locator file name to nemo.view


#### Below are the methods can be used to auto generate the code.
By, Wait, Present, Visible, WaitVisible, WaitVisibleClick, WaitVisibleGetText
##### Present : To check if the element is present, we make use of Present method.
##### WaitVisible : To check if element is visible or not, we make use of waitVisible method.
##### WaitVisibleClick : To click a element use WaitVisibleClick method.
##### WaitVisibleGetText : To fetch the text of the element use WaitVisibleGetText method.

### How to use Locator Extensions
-	You can try hit the chrome icon to stat the browser, visit the application by entering url and test the commands.
-	You can try hit 3 dots beside locators and get below Extensions 
  * closeTab – Clik to close the tab
  *	getCurrenturl – Click to get the current url
  *	switchToMainTab – Click to switch to main tab of the application
  *	switchToNextTab – Click to go to next tab when multiple tabs are opened.


Whenever new locators are added to .json file refresh the LOCATORS. The newly added locator will be displayed in LOCATORS list
Highlight Element : Whenever element is visible and exists user can highlight the element.
![Highlights](https://github.com/zzhengjian/PO-Manager/blob/main/docs/HighlightElement.gif)

There are multiple functions as listed below when user right click on locator
 E.g : 
  *	Clear
  *	Click
  * getText etc



