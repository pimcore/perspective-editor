pimcore.registerNS('pimcore.settings.perspectiveview');

pimcore.settings.perspectiveview = Class.create({

    panelId: 'perspective_view_panel_id',
    perspectiveTreeStore: null,
    viewTreeStore: null,
    perspectiveEditPanel: null,
    viewEditPanel: null,
    availablePortlets: [
        {name: t('modificationStatistic'), value: 'pimcore.layout.portlets.modificationStatistic'},
        {name: t('modifiedDocuments'), value: 'pimcore.layout.portlets.modifiedDocuments'},
        {name: t('modifiedAssets'), value: 'pimcore.layout.portlets.modifiedAssets'},
        {name: t('modifiedObjects'), value: 'pimcore.layout.portlets.modifiedObjects'},
        {name: t('analytics'), value: 'pimcore.layout.portlets.analytics'},
        {name: t('piwik'), value: 'pimcore.layout.portlets.piwik'},
        {name: t('customreports'), value: 'pimcore.layout.portlets.customreports'}
    ],

    initialize: function(){
        this.getTabPanel();
    },

    activate: function () {
       Ext.getCmp('pimcore_panel_tabs').setActiveItem(this.panelId);
    },

    getTabPanel: function () {
        if (!this.panel) {

            this.panel = new Ext.Panel({
                id: this.panelId,
                iconCls: 'pimcore_icon_binoculars',
                title: t('perspective_view_editor'),
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
                pimcore.globalmanager.remove('perspective_view');
            }.bind(this));

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

    createPerspectiveEditor: function(){
        this.perspectiveEditPanel = new Ext.Panel({
            region: "center",
            width: '75%',
            autoScroll: true,
        });

        this.perspectiveTreeStore = new Ext.data.TreeStore({
            autoLoad: true,
            proxy: {
                type: 'ajax',
                url: '/admin/perspectives-views/perspectives/get-tree',
                reader: {
                    type: 'json'
                }
            },
        });

        return new Ext.Panel({
            title: 'perspective_editor',
            border: false,
            layout: 'border',
            items: [
                new Ext.tree.Panel({
                    title: t('available_perspectives'),
                    region: "west",
                    autoScroll: true,
                    animate: false,
                    containerScroll: true,
                    width: '25%',
                    split: true,
                    store: this.perspectiveTreeStore,
                    rootVisible: false,
                    listeners: {
                        itemclick: function(tree, record){
                            this.buildPerspectiveEditorPanel(record);
                        }.bind(this),
                        itemcontextmenu: function (tree, record, item, index, e, eOpts ) {
                            e.stopEvent();
                            var menuItems = this.buildPerspectiveContextMenuItems(record);
                            if(menuItems.length > 0){
                                var menu = new Ext.menu.Menu({
                                    items: menuItems
                                });
                                menu.showAt(e.pageX, e.pageY);
                            }
                        }.bind(this)
                    },
                }),
                this.perspectiveEditPanel
            ],
            bbar: new Ext.toolbar.Toolbar({
                style: 'background: #e0e1e2',
                items: [
                    "->",
                    new Ext.Button({
                        text: t("reload"),
                        iconCls: "pimcore_icon_reload",
                        handler: function () {
                            Ext.MessageBox.show({
                                title: t('are_you_sure'),
                                msg: t('confirm_reload'),
                                buttons: Ext.Msg.OKCANCEL,
                                icon: Ext.MessageBox.INFO,
                                fn: function (button) {
                                    if (button === 'ok') {
                                        this.perspectiveTreeStore.reload();
                                        this.perspectiveEditPanel.removeAll();
                                    }
                                }.bind(this),
                            });
                        }.bind(this),
                    }),
                    new Ext.Button({
                        text: t("save"),
                        iconCls: "pimcore_icon_save",
                        handler: function () {
                            Ext.Ajax.request({
                                url: '/admin/perspectives-views/perspectives/save',
                                params: {
                                    data: Ext.JSON.encode(this.perspectiveTreeStore.getRoot().serialize())
                                },
                                method: 'POST', success: function (response) {
                                    responseObject = Ext.decode(response.responseText);
                                    if (responseObject.success) {
                                        pimcore.helpers.showNotification(t("success"), t("saved_successfully"), "success");
                                        this.perspectiveTreeStore.reload();
                                        this.perspectiveEditPanel.removeAll();
                                    } else {
                                        pimcore.helpers.showNotification(t("error"), responseObject.error, "error")
                                    }
                                }.bind(this),
                            });
                        }.bind(this),
                    }),
                ],
            }),
        });
    },
});

setTimeout(function(){
    new pimcore.settings.perspectiveview();
}, 2000);
