/**
 * Pimcore
 *
 * This source file is available under two different licenses:
 * - GNU General Public License version 3 (GPLv3)
 * - Pimcore Commercial License (PCL)
 * Full copyright and license information is available in
 * LICENSE.md which is distributed with this source code.
 *
 * @copyright  Copyright (c) Pimcore GmbH (http://www.pimcore.org)
 * @license    http://www.pimcore.org/license     GPLv3 and PCL
 */

/**
 * before permissions are loaded
 * context, menu and permissions are passed as parameters
 */
pimcore.events.onPerspectiveEditorLoadPermissions = "pimcore.perspectiveEditor.permissions.load";

/**
 * before permissions structure is loaded
 * context and structure are passed as parameters
 */
pimcore.events.onPerspectiveEditorLoadStructureForPermissions = "pimcore.perspectiveEditor.permissions.structure.load";

/**
 * fired before add elementTreeSettingsForm to perspectiveEditPanel
 * record and perspectiveElementTreeSettingsFormId and setDirtyCallBack are passed as parameters
 */
pimcore.events.preAddPerspectiveEditorElementTreeSettingsForm = "pimcore.perspectiveEditor.elementTreeSettingsForm.preAdd";

/**
 * fired after PerspectiveElementTreeTypeStore was  created
 *  PerspectiveElementTreeTypeStoreId  is passed as parameter
 */
pimcore.events.postCreatePerspectiveEditorElementTreeTypeStore = "pimcore.perspectiveEditor.elementTreeTypeStore.postCreate";

/**
 * fired after ElementTreeIcons Array was  initialized
 */
pimcore.events.addPerspectiveEditorElementTreeIcon = 'pimcore.perspectiveEditor.elementTreeIcon.add';




//TODO: delete once support for Pimcore 10.6 is dropped
if(typeof addEventListenerCompatibilityForPlugins === "function") {
    let eventMappings = [];
    eventMappings["onPerspectiveEditorLoadPermissions"] = pimcore.events.onPerspectiveEditorLoadPermissions;
    eventMappings["onPerspectiveEditorLoadStructureForPermissions"] = pimcore.events.onPerspectiveEditorLoadStructureForPermissions;
    addEventListenerCompatibilityForPlugins(eventMappings);
    console.warn("Deprecation: addEventListenerCompatibilityForPlugins will be not supported in Pimcore 11.");
}
