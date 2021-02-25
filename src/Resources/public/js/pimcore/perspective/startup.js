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

pimcore.registerNS('pimcore.settings.perspectiveview');

pimcore.settings.perspectiveview = Class.create({

    panelId: 'perspective_view_panel_id',

    initialize: function(){
        pimcore.plugin.broker.registerPlugin(this);
    },

    activate: function () {
       Ext.getCmp('pimcore_panel_tabs').setActiveItem(this.getTabPanel());
    },

    getTabPanel: function () {
        if (!this.panel) {
            const user = pimcore.globalmanager.get('user');

            this.panel = new Ext.Panel({
                id: this.panelId,
                iconCls: 'pimcore_nav_icon_perspective',
                title: t('plugin_pimcore_perspectiveeditor_perspective_view_editor'),
                border: false,
                layout: 'fit',
                closable: true,
                items: [
                    new Ext.TabPanel({
                        items: [
                            new pimcore.bundle.perspectiveeditor.PerspectiveEditor(),
                            new pimcore.bundle.perspectiveeditor.ViewEditor(!user.admin),
                        ],
                    }),
                ],
            });

            var tabPanel = Ext.getCmp('pimcore_panel_tabs');
            tabPanel.add(this.panel);
            tabPanel.setActiveItem(this.panelId);

            this.panel.on('destroy', function () {
                pimcore.globalmanager.get('plugin_pimcore_perspectiveeditor').panel = false;
                pimcore.globalmanager.remove('plugin_pimcore_perspectiveeditor');
            });

            pimcore.layout.refresh();
        }

        return this.panel;
    },

    addToPimcorePanel: function(id){
        pimcore.globalmanager.get(id).on("beforedestroy", function () {
            pimcore.globalmanager.remove(id);
        });

        var pimcoreTabPanel = Ext.getCmp("pimcore_panel_tabs");
        pimcoreTabPanel.add(pimcore.globalmanager.get(id));
        pimcoreTabPanel.setActiveItem(id);

        pimcore.layout.refresh();
    },

    pimcoreReady: function(){
        const perspectiveCfg = pimcore.globalmanager.get('perspective');
        const user = pimcore.globalmanager.get('user');
        const menu = pimcore.globalmanager.get('layout_toolbar').settingsMenu;

        if(menu && perspectiveCfg.inToolbar('settings.perspectiveEditor') && user.isAllowed('perspective_editor')) {
            menu.add({
                text: t('plugin_pimcore_perspectiveeditor_perspective_view_editor'),
                iconCls: 'pimcore_nav_icon_perspective',
                handler: function(){
                    try{
                        pimcore.globalmanager.get('plugin_pimcore_perspectiveeditor').activate();
                    } catch (e) {
                        this.getTabPanel();
                        pimcore.globalmanager.add('plugin_pimcore_perspectiveeditor', this);
                    }
                }.bind(this)
            });
        }

    },
});

new pimcore.settings.perspectiveview();
