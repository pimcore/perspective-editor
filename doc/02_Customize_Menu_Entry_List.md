# Customize Menu Entry List

Custom view and perspective settings also allow configuring the context menu and toolbar menu entries. 
It might be necessary to add additional entries due to bundles or application code. 

This is possible with following code lines. Add this for example into the `pimcoreReady` hook of your 
bundle. 

```javascript
    if(pimcore.bundle && pimcore.bundle.perspectiveeditor && pimcore.bundle.perspectiveeditor.MenuItemPermissionHelper) {
        pimcore.bundle.perspectiveeditor.MenuItemPermissionHelper.permissions.toolbar.search.push('items.advancedObjectSearch');
    }
``` 

For all available entries have a look at [MenuItemPermissionHelper](https://github.com/pimcore/perspective-editor/blob/main/src/Resources/public/js/pimcore/perspective/menuItemPermissionHelper.js).
