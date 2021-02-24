pimcore.registerNS('pimcore.settings.perspectiveview');

pimcore.settings.perspectiveview = Class.create({

    panelId: 'perspective_view_panel_id',
    // perspectiveTreeStore: null,
    // viewTreeStore: null,
    // viewEditPanel: null,
    // availablePortlets: [
    //     {name: t('modificationStatistic'), value: 'pimcore.layout.portlets.modificationStatistic'},
    //     {name: t('modifiedDocuments'), value: 'pimcore.layout.portlets.modifiedDocuments'},
    //     {name: t('modifiedAssets'), value: 'pimcore.layout.portlets.modifiedAssets'},
    //     {name: t('modifiedObjects'), value: 'pimcore.layout.portlets.modifiedObjects'},
    //     {name: t('analytics'), value: 'pimcore.layout.portlets.analytics'},
    //     {name: t('piwik'), value: 'pimcore.layout.portlets.piwik'},
    //     {name: t('customreports'), value: 'pimcore.layout.portlets.customreports'}
    // ],

    initialize: function(){
        pimcore.plugin.broker.registerPlugin(this);
    },

    activate: function () {
       Ext.getCmp('pimcore_panel_tabs').setActiveItem(this.getTabPanel());
    },

    getTabPanel: function () {
        if (!this.panel) {
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
                            new PerspectiveEditor(),
                            new ViewEditor(),
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
        var menu = pimcore.globalmanager.get('layout_toolbar').settingsMenu;
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
    },
});

new pimcore.settings.perspectiveview();
