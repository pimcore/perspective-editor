/**
* This source file is available under the terms of the
* Pimcore Open Core License (POCL)
* Full copyright and license information is available in
* LICENSE.md which is distributed with this source code.
*
*  @copyright  Copyright (c) Pimcore GmbH (http://www.pimcore.com)
*  @license    Pimcore Open Core License (POCL)
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