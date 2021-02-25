/**
 * Pimcore
 *
 * This source file is available under two different licenses:
 * - GNU General Public License version 3 (GPLv3)
 * - Pimcore Enterprise License (PEL)
 * Full copyright and license information is available in
 * LICENSE.md which is distributed with this source code.
 *
 *  @copyright  Copyright (c) Pimcore GmbH (http://www.pimcore.org)
 *  @license    http://www.pimcore.org/license     GPLv3 and PEL
 */

pimcore.registerNS('pimcore.bundle.perspectiveeditor.MenuItemPermissionHelper');

pimcore.bundle.perspectiveeditor.MenuItemPermissionHelper = class {

    static permissions = {
        customViewContextMenu: {
            document: [
                'items.add',
                'items.addSnippet',
                'items.addLink',
                'items.addEmail',
                'items.addNewsletter',
                'items.addHardlink',
                'items.addFolder',
                'items.addPrintPage',
                'items.paste',
                'items.pasteCut',
                'items.copy',
                'items.cut',
                'items.rename',
                'items.unpublish',
                'items.publish',
                'items.delete',
                'items.open',
                'items.convert',
                'items.searchAndMove',
                'items.useAsSite',
                'items.editSite',
                'items.removeSite',
                'items.lock',
                'items.unlock',
                'items.lockAndPropagate',
                'items.unlockAndPropagate',
                'items.reload'
            ],
            asset: [
                'items.add.hidden',
                'items.add.items.upload',
                'items.add.items.uploadCompatibility',
                'items.add.items.uploadZip',
                'items.add.items.importFromServer',
                'items.add.items.uploadFromUrl',
                'items.addFolder',
                'items.rename',
                'items.copy',
                'items.cut',
                'items.paste',
                'items.pasteCut',
                'items.delete',
                'items.searchAndMove',
                'items.lock',
                'items.unlock',
                'items.lockAndPropagate',
                'items.unlockAndPropagate',
                'items.reload'
            ],
            object: [
                'items.add',
                'items.addFolder',
                'items.importCsv',
                'items.cut',
                'items.copy',
                'items.paste',
                'items.delete',
                'items.rename',
                'items.reload',
                'items.publish',
                'items.unpublish',
                'items.searchAndMove',
                'items.lock',
                'items.unlock',
                'items.lockAndPropagate',
                'items.unlockAndPropagate',
                'items.changeChildrenSortBy'
            ]
        },
        toolbar: {
            file: [
                'hidden',
                'items.perspectives',
                'items.dashboards',
                'items.openDocument',
                'items.openAsset',
                'items.openObject',
                'items.searchReplace',
                'items.schedule',
                'items.seemode',
                'items.closeAll',
                'items.help',
                'items.about'
            ],
            marketing: [
                'hidden',
                'items.reports',
                'items.tagmanagement',
                'items.targeting',
                'items.seo.hidden',
                'items.seo.items.documents',
                'items.seo.items.robots',
                'items.seo.items.httperrors'
            ],
            extras: [
                'hidden',
                'items.glossary',
                'items.redirects',
                'items.translations',
                'items.recyclebin',
                'items.plugins',
                'items.notesEvents',
                'items.applicationlog',
                'items.gdpr_data_extractor',
                'items.emails',
                'items.maintenance',
                'items.systemtools.hidden',
                'items.systemtools.items.phpinfo',
                'items.systemtools.items.opcache',
                'items.systemtools.items.requirements',
                'items.systemtools.items.serverinfo',
                'items.systemtools.items.database',
                'items.systemtools.items.fileexplorer'
            ],
            settings: [
                'hidden',
                'items.customReports',
                'items.marketingReports',
                'items.documentTypes',
                'items.predefinedProperties',
                'items.predefinedMetadata',
                'items.system',
                'items.website',
                'items.web2print',
                'items.users.hidden',
                'items.users.items.users',
                'items.users.items.roles',
                'items.thumbnails',
                'items.objects.hidden',
                'items.objects.items.classes',
                'items.objects.items.fieldcollections',
                'items.objects.items.objectbricks',
                'items.objects.items.quantityValue',
                'items.objects.items.classificationstore',
                'items.objects.items.bulkExport',
                'items.objects.items.bulkImport',
                'items.routes',
                'items.cache.hidden',
                'items.cache.items.clearAll',
                'items.cache.items.clearData',
                'items.cache.items.clearSymfony',
                'items.cache.items.clearOutput',
                'items.cache.items.clearTemp',
                'items.adminTranslations',
                'items.tagConfiguration',
                'items.perspectiveEditor'
            ],
            search: [
                'hidden',
                'items.quickSearch',
                'items.documents',
                'items.assets',
                'items.objects'
            ]
        }
    };

    static loadPermissions(context, menu) {
        return this.permissions[context][menu];
    }

}