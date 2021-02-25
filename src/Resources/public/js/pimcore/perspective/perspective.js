class PerspectiveEditor{

    routePrefix = '/admin/perspectives-views/perspective';
    availablePortlets = [
        {name: t('modificationStatistic'), value: 'pimcore.layout.portlets.modificationStatistic'},
        {name: t('modifiedDocuments'), value: 'pimcore.layout.portlets.modifiedDocuments'},
        {name: t('modifiedAssets'), value: 'pimcore.layout.portlets.modifiedAssets'},
        {name: t('modifiedObjects'), value: 'pimcore.layout.portlets.modifiedObjects'},
        {name: t('analytics'), value: 'pimcore.layout.portlets.analytics'},
        {name: t('piwik'), value: 'pimcore.layout.portlets.piwik'},
        {name: t('customreports'), value: 'pimcore.layout.portlets.customreports'}
    ];
    activeRecordId = null;

    constructor () {
        if (!this.panel) {
            this.availableViewsStore = new Ext.data.Store({
                storeId: 'availableViewsStore',
                fields: ['name', 'id'],
                autoLoad: true
            });

            this.perspectiveEditPanel = new Ext.Panel({
                region: "center",
                width: '75%',
                autoScroll: true,
            });

            this.perspectiveTreeStore = new Ext.data.TreeStore({
                autoLoad: true,
                proxy: {
                    type: 'ajax',
                    url: this.routePrefix + '/get-tree',
                    reader: {
                        type: 'json'
                    }
                }
            });

            this.panel = new Ext.Panel({
                title: t('plugin_pimcore_perspectiveeditor_perspective_editor'),
                iconCls: 'plugin_pimcore_perspective_editor_perspective',
                border: false,
                layout: 'border',
                items: [
                    new Ext.tree.Panel({
                        region: "west",
                        autoScroll: true,
                        animate: false,
                        containerScroll: true,
                        width: '25%',
                        split: true,
                        store: this.perspectiveTreeStore,
                        rootVisible: false,
                        viewConfig: {
                            plugins: {
                                ptype: 'treeviewdragdrop',
                                enableDrag: true,
                                enableDrop: true,
                            }
                        },
                        listeners: {
                            itemclick: function(tree, record){
                                this.buildPerspectiveEditorPanel(record);
                            }.bind(this),
                            itemcontextmenu: function (tree, record, item, index, e, eOpts ) {
                                e.stopEvent();
                                var menuItems = this.buildPerspectiveContextMenuItems(record, tree);
                                if(menuItems.length > 0){
                                    var menu = new Ext.menu.Menu({
                                        items: menuItems
                                    });
                                    menu.showAt(e.pageX, e.pageY);
                                }
                            }.bind(this),
                            itemmove: function() {
                                this.setDirty(true);
                            }.bind(this)
                        },
                        tbar: {
                            cls: 'pimcore_toolbar_border_bottom',
                            items: [
                                new Ext.Button({
                                    text: t("plugin_pimcore_perspectiveeditor_add_perspective"),
                                    iconCls: "pimcore_icon_plus",
                                    handler: function(){
                                        Ext.MessageBox.prompt(t('plugin_pimcore_perspectiveeditor_new_perspective'), t('plugin_pimcore_perspectiveeditor_new_perspective'), function (button, value) {
                                            if (button === 'ok' && value.length > 0) {
                                                this.perspectiveTreeStore.getRoot().appendChild({
                                                    id: PerspectiveViewHelper.generateUuid(),
                                                    text: value,
                                                    name: value,
                                                    type: 'perspective',
                                                    icon: '/bundles/pimcoreadmin/img/flat-color-icons/reading.svg',
                                                    expanded: true,
                                                    children: [
                                                        {
                                                            id: PerspectiveViewHelper.generateUuid(),
                                                            text: t('plugin_pimcore_perspectiveeditor_icon'),
                                                            type: 'icon',
                                                            leaf: true,
                                                            icon: '/bundles/pimcoreadmin/img/flat-color-icons/marker.svg',
                                                            config: {
                                                                iconCls: null,
                                                                icon: null,
                                                            },
                                                        },
                                                        {
                                                            id: PerspectiveViewHelper.generateUuid(),
                                                            text: t('plugin_pimcore_perspectiveeditor_elementTreeLeft'),
                                                            type: 'elementTree',
                                                            leaf: false,
                                                            expanded: true,
                                                            children: [],
                                                            icon: '/bundles/pimcoreadmin/img/flat-color-icons/left_down2.svg',
                                                            config: {
                                                                iconCls: null,
                                                                icon: null,
                                                            },
                                                        },{
                                                            id: PerspectiveViewHelper.generateUuid(),
                                                            text: t('plugin_pimcore_perspectiveeditor_elementTreeRight'),
                                                            type: 'elementTreeRight',
                                                            leaf: false,
                                                            expanded: true,
                                                            children: [],
                                                            icon: '/bundles/pimcoreadmin/img/flat-color-icons/right_down2.svg',
                                                            config: {
                                                                iconCls: null,
                                                                icon: null,
                                                            },
                                                        },
                                                        {
                                                            id: PerspectiveViewHelper.generateUuid(),
                                                            text: t('plugin_pimcore_perspectiveeditor_dashboard'),
                                                            type: 'dashboard',
                                                            leaf: true,
                                                            icon: '/bundles/pimcoreadmin/img/flat-color-icons/dashboard.svg',
                                                            config: [],
                                                        },
                                                        {
                                                            id: PerspectiveViewHelper.generateUuid(),
                                                            text: t('plugin_pimcore_perspectiveeditor_toolbar'),
                                                            type: 'toolbar',
                                                            leaf: true,
                                                            icon: '/bundles/pimcoreadmin/img/flat-color-icons/support.svg',
                                                            config: {
                                                                file: {
                                                                    hidden: false,
                                                                },
                                                                extras: {
                                                                    hidden: false,
                                                                },
                                                                marketing: {
                                                                    hidden: false,
                                                                },
                                                                settings: {
                                                                    hidden: false,
                                                                },
                                                                search: {
                                                                    hidden: false,
                                                                }
                                                            },
                                                        },
                                                    ]
                                                });
                                                this.setDirty(true);
                                                PerspectiveViewHelper.reloadTreeNode(this.perspectiveTreeStore.getRoot().lastChild);
                                            }
                                        }.bind(this))
                                    }.bind(this)
                                }),
                            ],
                        },
                    }),
                    this.perspectiveEditPanel
                ],
                buttons: [
                        "->",
                        new Ext.Button({
                            text: t("plugin_pimcore_perspectiveeditor_reload"),
                            iconCls: "pimcore_icon_reload",
                            handler: function () {
                                Ext.MessageBox.show({
                                    title: t('plugin_pimcore_perspectiveeditor_are_you_sure'),
                                    msg: t('plugin_pimcore_perspectiveeditor_confirm_reload'),
                                    buttons: Ext.Msg.OKCANCEL,
                                    icon: Ext.MessageBox.INFO,
                                    fn: function (button) {
                                        if (button === 'ok') {
                                            this.perspectiveTreeStore.reload();
                                            this.perspectiveEditPanel.removeAll();
                                            this.setDirty(false);
                                        }
                                    }.bind(this)
                                });
                            }.bind(this)
                        }),
                        new Ext.Button({
                            text: t("save"),
                            iconCls: "pimcore_icon_apply",
                            handler: function () {
                                Ext.Ajax.request({
                                    url: this.routePrefix + '/update',
                                    params: {
                                        data: Ext.JSON.encode(this.perspectiveTreeStore.getRoot().serialize())
                                    },
                                    method: 'POST', success: function (response) {
                                        const responseObject = Ext.decode(response.responseText);
                                        if (responseObject.success) {
                                            pimcore.helpers.showNotification(t("success"), t("saved_successfully"), "success");
                                            this.setDirty(false);
                                        } else {
                                            pimcore.helpers.showNotification(t("error"), t(responseObject.error), "error");
                                        }
                                    }.bind(this)
                                });
                            }.bind(this)
                        }),
                ]
            });
        }

        return this.panel;
    }

    buildPerspectiveContextMenuItems (record, tree){
        const items = [];

        if(record.data.type === 'elementTree' || record.data.type === 'elementTreeRight'){
            items.push(this.buildAddDialog(record, tree));
        }
        if(record.data.type === 'perspective' && record.data.text !== 'default'){
            items.push(this.buildRenameDialog(record));
            items.push(this.buildDeleteDialog(record, true));
        }
        if(record.data.type === 'elementTreeElement'){
            items.push(this.buildDeleteDialog(record));
        }
        if(record.data.type === 'dashboard'){
            items.push(this.buildAddDialog(record, tree));
        }
        if(record.data.type === 'dashboardDefinition'){
            items.push(this.buildRenameDialog(record));
            items.push(this.buildDeleteDialog(record));
        }

        return items;
    }

    buildRenameDialog (record){
        return Ext.menu.Item({
            text: t('plugin_pimcore_perspectiveeditor_rename'),
            iconCls: 'pimcore_icon_edit',
            handler: function(){
                Ext.MessageBox.prompt(t('plugin_pimcore_perspectiveeditor_rename'), t('plugin_pimcore_perspectiveeditor_perspective_rename'), function (button, value) {
                    if (button === 'ok' && value !== record.data.text) {
                        record.data.text = value;
                        record.data.name = value;
                        PerspectiveViewHelper.reloadTreeNode(record);
                        this.setDirty(true);
                    }
                }.bind(this), this, false, record.data.text);
            }.bind(this)
        });
    }

    buildAddDialog (record, tree){
        return Ext.menu.Item({
            text: t('plugin_pimcore_perspectiveeditor_add'),
            iconCls: 'pimcore_icon_add',
            handler: function(){
                switch (record.data.type){
                    case 'elementTree': this.addElementTree(record, tree, 'left'); break;
                    case 'elementTreeRight': this.addElementTree(record, tree, 'right'); break;
                    case 'dashboard': this.addDashboard(record, tree); break;
                }
                PerspectiveViewHelper.reloadTreeNode(record);
                this.setDirty(true);
            }.bind(this)
        });
    }

    addElementTree (parent, tree, position) {
        const record = parent.appendChild({
            text: 'documents',
            type: 'elementTreeElement',
            leaf: true,
            iconCls: 'pimcore_icon_document',
            config: {
                type: 'documents',
                position: position,
                sort: 0,
            },
        });

        parent.expand();
        tree.getSelectionModel().select(record);
        this.buildPerspectiveEditorPanel(record);
    }

    addDashboard (parent, tree) {
        const colDefault = {
            type: '-',
            config: null,
        }

        const record = parent.appendChild({
            text: t('plugin_pimcore_perspectiveeditor_new_dashboard_definition'),
            type: 'dashboardDefinition',
            leaf: true,
            iconCls: 'pimcore_icon_welcome',
            config: {
                positions: [
                    [colDefault],
                    [colDefault],
                ]
            }
        });

        parent.expand();
        tree.getSelectionModel().select(record);
        this.buildPerspectiveEditorPanel(record);
    }

    buildDeleteDialog (record, forceClose){
        return Ext.menu.Item({
            text: t('delete'),
            iconCls: "pimcore_icon_delete",
            handler: function(){
                Ext.MessageBox.show({
                    title:t('plugin_pimcore_perspectiveeditor_are_you_sure'),
                    msg: t('plugin_pimcore_perspectiveeditor_confirm_delete'),
                    buttons: Ext.Msg.OKCANCEL ,
                    icon: Ext.MessageBox.INFO ,
                    fn: function (button) {
                        if (button === 'ok') {
                            if(forceClose || this.activeRecordId === record.id) {
                                this.perspectiveEditPanel.removeAll();
                            }
                            record.parentNode.removeChild(record);
                            this.setDirty(true);
                        }
                    }.bind(this)
                });
            }.bind(this)
        });
    }

    buildPerspectiveEditorPanel (record){
        this.perspectiveEditPanel.removeAll();
        this.activeRecordId = record.id;

        switch(record.data.type){
            case 'icon': this.perspectiveEditPanel.add(PerspectiveViewHelper.createIconFormPanel(record, PerspectiveViewHelper.generateUuid(), false, this.setDirty.bind(this, true))); break;
            case 'elementTreeElement': this.perspectiveEditPanel.add(this.createElementTreePanel(record)); break;
            case 'dashboard': this.perspectiveEditPanel.add(this.createDashboardFormPanel(record)); break;
            case 'dashboardDefinition': this.perspectiveEditPanel.add(this.createDashboardDefinitionFormPanel(record)); break;
            case 'toolbar': this.perspectiveEditPanel.add(this.createToolbarFormPanel(record)); break;
        }
    }

    createToolbarFormPanel (record){
        record.data.config = Object.assign({}, record.data.config);
        var config = record.data.config;

        var structure = {
            file: ['hidden', 'items.perspectives', 'items.dashboards', 'items.openDocument', 'items.openAsset', 'items.openObject', 'items.searchReplace', 'items.schedule', 'items.seemode', 'items.closeAll', 'items.help', 'items.about'],
            marketing: ['hidden', 'items.reports', 'items.tagmanagement', 'items.targeting', 'items.seo.hidden', 'items.seo.items.documents', 'items.seo.items.robots', 'items.seo.items.httperrors'],
            extras: ['hidden', 'items.glossary', 'items.redirects', 'items.translations', 'items.recyclebin', 'items.plugins', 'items.notesEvents', 'items.applicationlog', 'items.gdpr_data_extractor', 'items.emails', 'items.maintenance', 'items.systemtools.hidden', 'items.systemtools.items.phpinfo', 'items.systemtools.items.opcache', 'items.systemtools.items.requirements', 'items.systemtools.items.serverinfo', 'items.systemtools.items.database', 'items.systemtools.items.fileexplorer'],
            settings: ['hidden', 'items.documentTypes', 'items.predefinedProperties', 'items.predefinedMetadata', 'items.system', 'items.website', 'items.web2print', 'items.users.hidden', 'items.users.items.users', 'items.users.items.roles', 'items.thumbnails', 'items.objects.hidden', 'items.objects.items.classes', 'items.objects.items.fieldcollections', 'items.objects.items.objectbricks', 'items.objects.items.quantityValue', 'items.objects.items.classificationstore', 'items.objects.items.bulkExport', 'items.objects.items.bulkImport', 'items.routes', 'items.cache.hidden', 'items.cache.items.clearAll', 'items.cache.items.clearData', 'items.cache.items.clearSymfony', 'items.cache.items.clearOutput', 'items.cache.items.clearTemp', 'items.cache.items.generatePreviews', 'items.adminTranslations', 'items.tagConfiguration'],
            search: ['hidden', 'items.documents', 'items.assets', 'items.objects']
        };
        PerspectiveViewHelper.checkAndCreateDataStructure(config, structure);

        return new Ext.Panel({
            title: t('plugin_pimcore_perspectiveeditor_toolbar_access'),
            iconCls: 'pimcore_icon_support',
            items: [
                new Ext.Panel({
                    width: '50%',
                    padding: '10',
                    autoscroll: true,
                    items: [
                        new Ext.form.FieldSet({
                            title: t('plugin_pimcore_perspectiveeditor_file'),
                            collapsible: true,
                            items: [
                                PerspectiveViewHelper.generateCheckbox(t('file_menu_hidden'), config.file, 'hidden', false, this.setDirty.bind(this, true)),
                                PerspectiveViewHelper.generateCheckbox(t('file_menu_perspectives'), config.file.items, 'perspectives', false, this.setDirty.bind(this, true)),
                                PerspectiveViewHelper.generateCheckbox(t('file_menu_dashboards'), config.file.items, 'dashboards', false, this.setDirty.bind(this, true)),
                                PerspectiveViewHelper.generateCheckbox(t('file_menu_openDocument'), config.file.items, 'openDocument', false, this.setDirty.bind(this, true)),
                                PerspectiveViewHelper.generateCheckbox(t('file_menu_openAsset'), config.file.items, 'openAsset', false, this.setDirty.bind(this, true)),
                                PerspectiveViewHelper.generateCheckbox(t('file_menu_openObject'), config.file.items, 'openObject', false, this.setDirty.bind(this, true)),
                                PerspectiveViewHelper.generateCheckbox(t('file_menu_searchReplace'), config.file.items, 'searchReplace', false, this.setDirty.bind(this, true)),
                                PerspectiveViewHelper.generateCheckbox(t('file_menu_schedule'), config.file.items, 'schedule', false, this.setDirty.bind(this, true)),
                                PerspectiveViewHelper.generateCheckbox(t('file_menu_seemode'), config.file.items, 'seemode', false, this.setDirty.bind(this, true)),
                                PerspectiveViewHelper.generateCheckbox(t('file_menu_closeAll'), config.file.items, 'closeAll', false, this.setDirty.bind(this, true)),
                                PerspectiveViewHelper.generateCheckbox(t('file_menu_help'), config.file.items, 'help', false, this.setDirty.bind(this, true)),
                                PerspectiveViewHelper.generateCheckbox(t('file_menu_about'), config.file.items, 'about', false, this.setDirty.bind(this, true))
                            ]
                        }),
                        new Ext.form.FieldSet({
                            title: t('plugin_pimcore_perspectiveeditor_extras'),
                            collapsible: true,
                            items: [
                                PerspectiveViewHelper.generateCheckbox(t('extra_menu_hidden'), config.extras, 'hidden', false, this.setDirty.bind(this, true)),
                                PerspectiveViewHelper.generateCheckbox(t('extra_menu_glossary'), config.extras.items, 'glossary', false, this.setDirty.bind(this, true)),
                                PerspectiveViewHelper.generateCheckbox(t('extra_menu_redirects'), config.extras.items, 'redirects', false, this.setDirty.bind(this, true)),
                                PerspectiveViewHelper.generateCheckbox(t('extra_menu_translations'), config.extras.items, 'translations', false, this.setDirty.bind(this, true)),
                                PerspectiveViewHelper.generateCheckbox(t('extra_menu_recyclebin'), config.extras.items, 'recyclebin', false, this.setDirty.bind(this, true)),
                                PerspectiveViewHelper.generateCheckbox(t('extra_menu_plugins'), config.extras.items, 'plugins', false, this.setDirty.bind(this, true)),
                                PerspectiveViewHelper.generateCheckbox(t('extra_menu_notesEvents'), config.extras.items, 'notesEvents', false, this.setDirty.bind(this, true)),
                                PerspectiveViewHelper.generateCheckbox(t('extra_menu_applicationlog'), config.extras.items, 'applicationlog', false, this.setDirty.bind(this, true)),
                                PerspectiveViewHelper.generateCheckbox(t('extra_menu_gdpr_data_extractor'), config.extras.items, 'gdpr_data_extractor', false, this.setDirty.bind(this, true)),
                                PerspectiveViewHelper.generateCheckbox(t('extra_menu_emails'), config.extras.items, 'emails', false, this.setDirty.bind(this, true)),
                                PerspectiveViewHelper.generateCheckbox(t('extra_menu_maintenance'), config.extras.items, 'maintenance', false, this.setDirty.bind(this, true)),
                                PerspectiveViewHelper.generateCheckbox(t('extra_menu_systemtools_hidden'), config.extras.items.systemtools, 'hidden', false, this.setDirty.bind(this, true)),
                                PerspectiveViewHelper.generateCheckbox(t('extra_menu_systemtools_phpinfo'), config.extras.items.systemtools.items, 'phpinfo', false, this.setDirty.bind(this, true)),
                                PerspectiveViewHelper.generateCheckbox(t('extra_menu_systemtools_opcache'), config.extras.items.systemtools.items, 'opcache', false, this.setDirty.bind(this, true)),
                                PerspectiveViewHelper.generateCheckbox(t('extra_menu_systemtools_requirements'), config.extras.items.systemtools.items, 'requirements', false, this.setDirty.bind(this, true)),
                                PerspectiveViewHelper.generateCheckbox(t('extra_menu_systemtools_serverinfo'), config.extras.items.systemtools.items, 'serverinfo', false, this.setDirty.bind(this, true)),
                                PerspectiveViewHelper.generateCheckbox(t('extra_menu_systemtools_database'), config.extras.items.systemtools.items, 'database', false, this.setDirty.bind(this, true)),
                                PerspectiveViewHelper.generateCheckbox(t('extra_menu_systemtools_fileexplorer'), config.extras.items.systemtools.items, 'fileexplorer', false, this.setDirty.bind(this, true))
                            ]
                        }),
                        new Ext.form.FieldSet({
                            title: t('plugin_pimcore_perspectiveeditor_marketing'),
                            collapsible: true,
                            items: [
                                PerspectiveViewHelper.generateCheckbox(t('marketing_menu_hidden'), config.marketing, 'hidden', false, this.setDirty.bind(this, true)),
                                PerspectiveViewHelper.generateCheckbox(t('marketing_menu_reports'), config.marketing.items, 'reports', false, this.setDirty.bind(this, true)),
                                PerspectiveViewHelper.generateCheckbox(t('marketing_menu_tagmanagement'), config.marketing.items, 'tagmanagement', false, this.setDirty.bind(this, true)),
                                PerspectiveViewHelper.generateCheckbox(t('marketing_menu_targeting'), config.marketing.items, 'targeting', false, this.setDirty.bind(this, true)),
                                PerspectiveViewHelper.generateCheckbox(t('marketing_menu_seo_hidden'), config.marketing.items.seo, 'hidden', false, this.setDirty.bind(this, true)),
                                PerspectiveViewHelper.generateCheckbox(t('marketing_menu_seo_documents'), config.marketing.items.seo.items, 'documents', false, this.setDirty.bind(this, true)),
                                PerspectiveViewHelper.generateCheckbox(t('marketing_menu_seo_robots'), config.marketing.items.seo.items, 'robots', false, this.setDirty.bind(this, true)),
                                PerspectiveViewHelper.generateCheckbox(t('marketing_menu_seo_httperrors'), config.marketing.items.seo.items, 'httperrors', false, this.setDirty.bind(this, true))
                            ]
                        }),
                        new Ext.form.FieldSet({
                            title: t('plugin_pimcore_perspectiveeditor_settings'),
                            items: [
                                PerspectiveViewHelper.generateCheckbox(t('settings_menu_hidden'), config.settings, 'hidden', false, this.setDirty.bind(this, true)),
                                PerspectiveViewHelper.generateCheckbox(t('settings_menu_documentTypes'), config.settings.items, 'documentTypes', false, this.setDirty.bind(this, true)),
                                PerspectiveViewHelper.generateCheckbox(t('settings_menu_predefinedProperties'), config.settings.items, 'predefinedProperties', false, this.setDirty.bind(this, true)),
                                PerspectiveViewHelper.generateCheckbox(t('settings_menu_predefinedMetadata'), config.settings.items, 'predefinedMetadata', false, this.setDirty.bind(this, true)),
                                PerspectiveViewHelper.generateCheckbox(t('settings_menu_system'), config.settings.items, 'system', false, this.setDirty.bind(this, true)),
                                PerspectiveViewHelper.generateCheckbox(t('settings_menu_website'), config.settings.items, 'website', false, this.setDirty.bind(this, true)),
                                PerspectiveViewHelper.generateCheckbox(t('settings_menu_web2print'), config.settings.items, 'web2print', false, this.setDirty.bind(this, true)),
                                PerspectiveViewHelper.generateCheckbox(t('settings_menu_users_hidden'), config.settings.items.users, 'hidden', false, this.setDirty.bind(this, true)),
                                PerspectiveViewHelper.generateCheckbox(t('settings_menu_users_users'), config.settings.items.users.items, 'users', false, this.setDirty.bind(this, true)),
                                PerspectiveViewHelper.generateCheckbox(t('settings_menu_users_roles'), config.settings.items.users.items, 'roles', false, this.setDirty.bind(this, true)),
                                PerspectiveViewHelper.generateCheckbox(t('settings_menu_thumbnails'), config.settings.items, 'thumbnails', false, this.setDirty.bind(this, true)),
                                PerspectiveViewHelper.generateCheckbox(t('settings_menu_objects_hidden'), config.settings.items.objects, 'hidden', false, this.setDirty.bind(this, true)),
                                PerspectiveViewHelper.generateCheckbox(t('settings_menu_objects_classes'), config.settings.items.objects.items, 'classes', false, this.setDirty.bind(this, true)),
                                PerspectiveViewHelper.generateCheckbox(t('settings_menu_objects_fieldcollections'), config.settings.items.objects.items, 'fieldcollections', false, this.setDirty.bind(this, true)),
                                PerspectiveViewHelper.generateCheckbox(t('settings_menu_objects_objectbricks'), config.settings.items.objects.items, 'objectbricks', false, this.setDirty.bind(this, true)),
                                PerspectiveViewHelper.generateCheckbox(t('settings_menu_objects_quantityValue'), config.settings.items.objects.items, 'quantityValue', false, this.setDirty.bind(this, true)),
                                PerspectiveViewHelper.generateCheckbox(t('settings_menu_objects_classificationstore'), config.settings.items.objects.items, 'classificationstore', false, this.setDirty.bind(this, true)),
                                PerspectiveViewHelper.generateCheckbox(t('settings_menu_objects_bulkExport'), config.settings.items.objects.items, 'bulkExport', false, this.setDirty.bind(this, true)),
                                PerspectiveViewHelper.generateCheckbox(t('settings_menu_objects_bulkImport'), config.settings.items.objects.items, 'bulkImport', false, this.setDirty.bind(this, true)),
                                PerspectiveViewHelper.generateCheckbox(t('settings_menu_routes'), config.settings.items, 'routes', false, this.setDirty.bind(this, true)),
                                PerspectiveViewHelper.generateCheckbox(t('settings_menu_cache_hidden'), config.settings.items.cache, 'hidden', false, this.setDirty.bind(this, true)),
                                PerspectiveViewHelper.generateCheckbox(t('settings_menu_cache_clearAll'), config.settings.items.cache.items, 'clearAll', false, this.setDirty.bind(this, true)),
                                PerspectiveViewHelper.generateCheckbox(t('settings_menu_cache_clearData'), config.settings.items.cache.items, 'clearData', false, this.setDirty.bind(this, true)),
                                PerspectiveViewHelper.generateCheckbox(t('settings_menu_cache_clearSymfony'), config.settings.items.cache.items, 'clearSymfony', false, this.setDirty.bind(this, true)),
                                PerspectiveViewHelper.generateCheckbox(t('settings_menu_cache_clearOutput'), config.settings.items.cache.items, 'clearOutput', false, this.setDirty.bind(this, true)),
                                PerspectiveViewHelper.generateCheckbox(t('settings_menu_cache_clearTemp'), config.settings.items.cache.items, 'clearTemp', false, this.setDirty.bind(this, true)),
                                PerspectiveViewHelper.generateCheckbox(t('settings_menu_cache_generatePreviews'), config.settings.items.cache.items, 'generatePreviews', false, this.setDirty.bind(this, true)),
                                PerspectiveViewHelper.generateCheckbox(t('settings_menu_adminTranslations'), config.settings.items, 'adminTranslations', false, this.setDirty.bind(this, true)),
                                PerspectiveViewHelper.generateCheckbox(t('settings_menu_tagConfiguration'), config.settings.items, 'tagConfiguration', false, this.setDirty.bind(this, true))
                            ]
                        }),
                        new Ext.form.FieldSet({
                            title: t('plugin_pimcore_perspectiveeditor_search'),
                            collapsible: true,
                            items: [
                                PerspectiveViewHelper.generateCheckbox(t('search_menu_hidden'), config.search, 'hidden', false, this.setDirty.bind(this, true)),
                                PerspectiveViewHelper.generateCheckbox(t('search_menu_documents'), config.search.items, 'documents', false, this.setDirty.bind(this, true)),
                                PerspectiveViewHelper.generateCheckbox(t('search_menu_assets'), config.search.items, 'assets', false, this.setDirty.bind(this, true)),
                                PerspectiveViewHelper.generateCheckbox(t('search_menu_objects'), config.search.items, 'objects', false, this.setDirty.bind(this, true))
                            ]
                        })
                    ]
                })
            ]
        });
    }

    createDashboardDefinitionFormPanel (record){
        var emptyValue = '-';
        var config = record.data.config;
        var forbiddenPortlets = Object.keys(record.parentNode.data.config);

        var selectablePortlets = this.availablePortlets.filter(function(availablePortlet){
            return !in_array(availablePortlet.value, forbiddenPortlets);
        }.bind(this));
        selectablePortlets.unshift({name: t('plugin_pimcore_perspectiveeditor_select_empty'), value: emptyValue});

        var gridData = [];
        var dashboardConfigCount = Math.max(record.data.config.positions[0].length, record.data.config.positions[1].length);

        for(var colIndex = 0; colIndex < 2; colIndex++){
            for(var rowIndex = 0; rowIndex < dashboardConfigCount; rowIndex++){
                var col = colIndex === 0 ? 'left' : 'right';
                if(!gridData[rowIndex]){
                    gridData[rowIndex] = {};
                }
                gridData[rowIndex][col] = typeof record.data.config.positions[colIndex][rowIndex] == 'undefined' ? emptyValue : record.data.config.positions[colIndex][rowIndex].type;
            }
        }

        var gridDataStore = new Ext.data.Store({
            data: gridData,
            listeners: {
                datachanged: function() {
                    this.setDirty(true);
                }.bind(this)
            }
        });

        var portletSelector = new Ext.form.ComboBox({
            editable: false,
            store: new Ext.data.Store({data: selectablePortlets}),
            displayField: 'name',
            valueField: 'value'
        });

        return new Ext.form.Panel({
            title: t('plugin_pimcore_perspectiveeditor_dashboard_assignment'),
            items: [
                new Ext.grid.Panel({
                    selType: 'cellmodel',
                    clicksToEdit: 1,
                    plugins: [
                        Ext.create('Ext.grid.plugin.CellEditing', {
                            clicksToEdit: 1,
                            listeners: {
                                beforeedit: function(editor, context, eOpts) {
                                    editor.editors.clear();
                                },
                                edit: function(editor, context){
                                    if(typeof record.data.config.positions[context.colIdx][context.rowIdx] == 'undefined'){
                                        record.data.config.positions[context.colIdx][context.rowIdx] = {
                                            id: null,
                                            type: null,
                                            config: null
                                        }
                                    }
                                    record.data.config.positions[context.colIdx][context.rowIdx].type = context.value;
                                }
                            }
                        })
                    ],
                    columns: [
                        {
                            text: t('plugin_pimcore_perspectiveeditor_left_column'),
                            width: '50%',
                            sortable: false,
                            hideable: false,
                            dataIndex: 'left',
                            getEditor: function() {
                                return portletSelector;
                            }
                        },
                        {
                            text: t('plugin_pimcore_perspectiveeditor_right_column'),
                            width: '50%',
                            sortable: false,
                            hideable: false,
                            dataIndex: 'right',
                            getEditor: function() {
                                return portletSelector;
                            }
                        }
                    ],
                    store: gridDataStore,
                    listeners: {
                        itemcontextmenu: function (tree, record, item, index, e, eOpts ) {
                            e.stopEvent();
                            var menuItems = this.buildDashboardContextMenuItems(record, index, gridDataStore);
                            if(menuItems.length > 0){
                                var menu = new Ext.menu.Menu({
                                    items: menuItems
                                });
                                menu.showAt(e.pageX, e.pageY);
                            }
                        }.bind(this)
                    }
                })
            ]
        });
    }

    buildDashboardContextMenuItems (record, index, gridData){
        var emptyValue = '-';
        return [
            Ext.menu.Item({
                text: t('plugin_pimcore_perspectiveeditor_add'),
                iconCls: 'pimcore_icon_add',
                handler: function(){
                    gridData.insert(index + 1, {left: emptyValue, right: emptyValue});
                    this.setDirty(true);
                }.bind(this)
            }),
            Ext.menu.Item({
                text: t('plugin_pimcore_perspectiveeditor_remove'),
                iconCls: 'pimcore_icon_delete',
                handler: function(){
                    Ext.MessageBox.show({
                        title:t('plugin_pimcore_perspectiveeditor_are_you_sure'),
                        msg: t('plugin_pimcore_perspectiveeditor_confirm_delete'),
                        buttons: Ext.Msg.OKCANCEL ,
                        icon: Ext.MessageBox.INFO ,
                        fn: function (button) {
                            if (button === 'ok') {
                                gridData.removeAt(index);
                                this.setDirty(true);
                            }
                        }.bind(this)
                    });
                }.bind(this)
            })
        ];
    }

    createDashboardFormPanel (record){
        var config = record.data.config;
        var data = this.availablePortlets;
        var items = [];

        for(var dataIndex in data){
            items.push(new Ext.form.Checkbox({
                padding: '5 10',
                width: '50%',
                boxLabel: data[dataIndex].name,
                portletValue: data[dataIndex].value,
                checked: config[data[dataIndex].value] === 1,
                listeners: {
                    change: function(elem, newValue, oldValue){
                        newValue ? config[elem.portletValue] = 1 : delete config[elem.name];
                        this.setDirty(true);
                    }.bind(this)
                }
            }));
        }

        return new Ext.form.Panel({
            title: t('plugin_pimcore_perspectiveeditor_dashboard_forbidden'),
            items: items
        });
    }

    createElementTreePanel (record){
        var config = record.data.config;
        if(!config.treeContextMenu){
            config.treeContextMenu = {};
        }

        var treeElementTypStore = new Ext.data.Store({
            fields: ['name', 'value'],
            data: [
                {name: t('plugin_pimcore_perspectiveeditor_document'), value: 'documents'},
                {name: t('plugin_pimcore_perspectiveeditor_asset'), value: 'assets'},
                {name: t('plugin_pimcore_perspectiveeditor_object'), value: 'objects'},
                {name: t('plugin_pimcore_perspectiveeditor_custom_view'), value: 'customview'}
            ]
        });

        var customViewComboBox = new Ext.form.ComboBox({
            padding: 10,
            width: '75%',
            fieldLabel: t('plugin_pimcore_perspectiveeditor_custom_view'),
            queryMode: 'local',
            store: this.availableViewsStore,
            displayField: 'name',
            valueField: 'id',
            name: 'view-id',
            editable: true,
            value: config.id,
            hidden: config.type !== 'customview',
            listeners: {
                change: function(elem, newValue, oldValue){
                    config.id = newValue;
                    this.setDirty(true);
                }.bind(this)
            }
        });

        var structure = {
            document: ['items.add', 'items.add', 'items.addSnippet', 'items.addLink', 'items.addEmail', 'items.addNewsletter', 'items.addHardlink', 'items.addFolder', 'items.paste', 'items.pasteCut', 'items.copy', 'items.cut', 'items.rename', 'items.unpublish', 'items.publish', 'items.delete', 'items.open', 'items.convert', 'items.searchAndMove', 'items.useAsSite', 'items.editSite', 'items.removeSite', 'items.lock', 'items.unlock', 'items.lockAndPropagate', 'items.unlockAndPropagate', 'items.reload'],
            asset: ['items.add.items.upload', 'items.add.items.uploadFromUrl', 'items.addFolder', 'items.rename', 'items.paste', 'items.pasteCut', 'items.delete', 'items.searchAndMove', 'items.lock', 'items.unlock', 'items.lockAndPropagate', 'items.unlockAndPropagate', 'items.reload.hidden'],
            object: ['items.add', 'items.addFolder', 'items.importCsv', 'items.cut', 'items.copy', 'items.delete', 'items.rename', 'items.reload', 'items.searchAndMove', 'items.lock', 'items.unlock', 'items.lockAndPropagate', 'items.unlockAndPropagate', 'items.changeChildrenSortBy']
        };

        PerspectiveViewHelper.checkAndCreateDataStructure(config.treeContextMenu, structure);

        var documentTreeContextMenuGroup = new Ext.form.FieldSet({
            title: t('plugin_pimcore_perspectiveeditor_document') + ' - ' + t('plugin_pimcore_perspectiveeditor_contextmenu'),
            hidden: config.type !== 'documents',
            margin: '30 10 0',
            width: 500,
            items: [
                PerspectiveViewHelper.generateCheckbox(t('add'), config.treeContextMenu.document.items, 'add', false, this.setDirty.bind(this, true)),
                PerspectiveViewHelper.generateCheckbox(t('addSnippet'), config.treeContextMenu.document.items, 'addSnippet', false, this.setDirty.bind(this, true)),
                PerspectiveViewHelper.generateCheckbox(t('addLink'), config.treeContextMenu.document.items, 'addLink', false, this.setDirty.bind(this, true)),
                PerspectiveViewHelper.generateCheckbox(t('addEmail'), config.treeContextMenu.document.items, 'addEmail', false, this.setDirty.bind(this, true)),
                PerspectiveViewHelper.generateCheckbox(t('addNewsletter'), config.treeContextMenu.document.items, 'addNewsletter', false, this.setDirty.bind(this, true)),
                PerspectiveViewHelper.generateCheckbox(t('addHardlink'), config.treeContextMenu.document.items, 'addHardlink', false, this.setDirty.bind(this, true)),
                PerspectiveViewHelper.generateCheckbox(t('addFolder'), config.treeContextMenu.document.items, 'addFolder', false, this.setDirty.bind(this, true)),
                PerspectiveViewHelper.generateCheckbox(t('paste'), config.treeContextMenu.document.items, 'paste', false, this.setDirty.bind(this, true)),
                PerspectiveViewHelper.generateCheckbox(t('pasteCut'), config.treeContextMenu.document.items, 'pasteCut', false, this.setDirty.bind(this, true)),
                PerspectiveViewHelper.generateCheckbox(t('copy'), config.treeContextMenu.document.items, 'copy', false, this.setDirty.bind(this, true)),
                PerspectiveViewHelper.generateCheckbox(t('cut'), config.treeContextMenu.document.items, 'cut', false, this.setDirty.bind(this, true)),
                PerspectiveViewHelper.generateCheckbox(t('rename'), config.treeContextMenu.document.items, 'rename', false, this.setDirty.bind(this, true)),
                PerspectiveViewHelper.generateCheckbox(t('unpublish'), config.treeContextMenu.document.items, 'unpublish', false, this.setDirty.bind(this, true)),
                PerspectiveViewHelper.generateCheckbox(t('publish'), config.treeContextMenu.document.items, 'publish', false, this.setDirty.bind(this, true)),
                PerspectiveViewHelper.generateCheckbox(t('delete'), config.treeContextMenu.document.items, 'delete', false, this.setDirty.bind(this, true)),
                PerspectiveViewHelper.generateCheckbox(t('open'), config.treeContextMenu.document.items, 'open', false, this.setDirty.bind(this, true)),
                PerspectiveViewHelper.generateCheckbox(t('convert'), config.treeContextMenu.document.items, 'convert', false, this.setDirty.bind(this, true)),
                PerspectiveViewHelper.generateCheckbox(t('searchAndMove'), config.treeContextMenu.document.items, 'searchAndMove', false, this.setDirty.bind(this, true)),
                PerspectiveViewHelper.generateCheckbox(t('useAsSite'), config.treeContextMenu.document.items, 'useAsSite', false, this.setDirty.bind(this, true)),
                PerspectiveViewHelper.generateCheckbox(t('editSite'), config.treeContextMenu.document.items, 'editSite', false, this.setDirty.bind(this, true)),
                PerspectiveViewHelper.generateCheckbox(t('removeSite'), config.treeContextMenu.document.items, 'removeSite', false, this.setDirty.bind(this, true)),
                PerspectiveViewHelper.generateCheckbox(t('lock'), config.treeContextMenu.document.items, 'lock', false, this.setDirty.bind(this, true)),
                PerspectiveViewHelper.generateCheckbox(t('unlock'), config.treeContextMenu.document.items, 'unlock', false, this.setDirty.bind(this, true)),
                PerspectiveViewHelper.generateCheckbox(t('lockAndPropagate'), config.treeContextMenu.document.items, 'lockAndPropagate', false, this.setDirty.bind(this, true)),
                PerspectiveViewHelper.generateCheckbox(t('unlockAndPropagate'), config.treeContextMenu.document.items, 'unlockAndPropagate', false, this.setDirty.bind(this, true)),
                PerspectiveViewHelper.generateCheckbox(t('reload'), config.treeContextMenu.document.items, 'reload', false, this.setDirty.bind(this, true))
            ]
        });

        var assetTreeContextMenuGroup = new Ext.form.FieldSet({
            title: t('asset') + ' - ' + t('contextmenu'),
            hidden: config.type !== 'assets',
            margin: '30 10 0',
            width: 500,
            items: [
                PerspectiveViewHelper.generateCheckbox(t('upload'), config.treeContextMenu.asset.items.add.items, 'upload', false, this.setDirty.bind(this, true)),
                PerspectiveViewHelper.generateCheckbox(t('uploadFromUrl'), config.treeContextMenu.asset.items.add.items, 'uploadFromUrl', false, this.setDirty.bind(this, true)),
                PerspectiveViewHelper.generateCheckbox(t('addFolder'), config.treeContextMenu.asset.items, 'addFolder', false, this.setDirty.bind(this, true)),
                PerspectiveViewHelper.generateCheckbox(t('rename'), config.treeContextMenu.asset.items, 'rename', false, this.setDirty.bind(this, true)),
                PerspectiveViewHelper.generateCheckbox(t('paste'), config.treeContextMenu.asset.items, 'paste', false, this.setDirty.bind(this, true)),
                PerspectiveViewHelper.generateCheckbox(t('pasteCut'), config.treeContextMenu.asset.items, 'pasteCut', false, this.setDirty.bind(this, true)),
                PerspectiveViewHelper.generateCheckbox(t('delete'), config.treeContextMenu.asset.items, 'delete', false, this.setDirty.bind(this, true)),
                PerspectiveViewHelper.generateCheckbox(t('searchAndMove'), config.treeContextMenu.asset.items, 'searchAndMove', false, this.setDirty.bind(this, true)),
                PerspectiveViewHelper.generateCheckbox(t('lock'), config.treeContextMenu.asset.items, 'lock', false, this.setDirty.bind(this, true)),
                PerspectiveViewHelper.generateCheckbox(t('unlock'), config.treeContextMenu.asset.items, 'unlock', false, this.setDirty.bind(this, true)),
                PerspectiveViewHelper.generateCheckbox(t('lockAndPropagate'), config.treeContextMenu.asset.items, 'lockAndPropagate', false, this.setDirty.bind(this, true)),
                PerspectiveViewHelper.generateCheckbox(t('unlockAndPropagate'), config.treeContextMenu.asset.items, 'unlockAndPropagate', false, this.setDirty.bind(this, true)),
                PerspectiveViewHelper.generateCheckbox(t('hide_reload'), config.treeContextMenu.asset.items.reload, 'hidden', true, this.setDirty.bind(this, true))
            ]
        });

        var objectTreeContextMenuGroup = new Ext.form.FieldSet({
            title: t('object') + ' - ' + t('contextmenu'),
            hidden: config.type !== 'objects',
            margin: '30 10 0',
            width: 500,
            items: [
                PerspectiveViewHelper.generateCheckbox(t('add object'), config.treeContextMenu.object.items, 'add', false, this.setDirty.bind(this, true)),
                PerspectiveViewHelper.generateCheckbox(t('add folder'), config.treeContextMenu.object.items, 'addFolder', false, this.setDirty.bind(this, true)),
                PerspectiveViewHelper.generateCheckbox(t('import csv'), config.treeContextMenu.object.items, 'importCsv', false, this.setDirty.bind(this, true)),
                PerspectiveViewHelper.generateCheckbox(t('cut'), config.treeContextMenu.object.items, 'cut', false, this.setDirty.bind(this, true)),
                PerspectiveViewHelper.generateCheckbox(t('copy'), config.treeContextMenu.object.items, 'copy', false, this.setDirty.bind(this, true)),
                PerspectiveViewHelper.generateCheckbox(t('delete'), config.treeContextMenu.object.items, 'delete', false, this.setDirty.bind(this, true)),
                PerspectiveViewHelper.generateCheckbox(t('rename'), config.treeContextMenu.object.items, 'rename', false, this.setDirty.bind(this, true)),
                PerspectiveViewHelper.generateCheckbox(t('reload'), config.treeContextMenu.object.items, 'reload', false, this.setDirty.bind(this, true)),
                PerspectiveViewHelper.generateCheckbox(t('search and move'), config.treeContextMenu.object.items, 'searchAndMove', false, this.setDirty.bind(this, true)),
                PerspectiveViewHelper.generateCheckbox(t('lock'), config.treeContextMenu.object.items, 'lock', false, this.setDirty.bind(this, true)),
                PerspectiveViewHelper.generateCheckbox(t('unlock'), config.treeContextMenu.object.items, 'unlock', false, this.setDirty.bind(this, true)),
                PerspectiveViewHelper.generateCheckbox(t('lockAndPropagate'), config.treeContextMenu.object.items, 'lockAndPropagate', false, this.setDirty.bind(this, true)),
                PerspectiveViewHelper.generateCheckbox(t('unlockAndPropagate'), config.treeContextMenu.object.items, 'unlockAndPropagate', false, this.setDirty.bind(this, true)),
                PerspectiveViewHelper.generateCheckbox(t('sorting'), config.treeContextMenu.object.items, 'changeChildrenSortBy', false, this.setDirty.bind(this, true))
            ]
        });

        return new Ext.form.Panel({
            title: t('plugin_pimcore_perspectiveeditor_tree_element_selection'),
            icon: '/bundles/pimcoreadmin/img/flat-color-icons/genealogy.svg',
            items: [
                new Ext.form.ComboBox({
                    padding: 10,
                    fieldLabel: t('plugin_pimcore_perspectiveeditor_view_type'),
                    queryMode: 'local',
                    store: treeElementTypStore,
                    displayField: 'name',
                    valueField: 'value',
                    name: 'type',
                    editable: false,
                    value: config.type,
                    listeners: {
                        change: function(elem, newValue, oldValue){
                            config.type = newValue;
                            customViewComboBox.setHidden(newValue !== 'customview');

                            documentTreeContextMenuGroup.setHidden(newValue !== 'documents');
                            assetTreeContextMenuGroup.setHidden(newValue !== 'assets');
                            objectTreeContextMenuGroup.setHidden(newValue !== 'objects');

                            const iconCls = {
                                documents: 'pimcore_icon_document',
                                assets: 'pimcore_icon_asset',
                                objects: 'pimcore_icon_object',
                                customview: 'pimcore_icon_custom_views',
                            }

                            record.data.text = newValue;
                            record.data.iconCls = iconCls[newValue];
                            PerspectiveViewHelper.reloadTreeNode(record);
                            this.setDirty(true);
                        }.bind(this)
                    }
                }),
                customViewComboBox,
                documentTreeContextMenuGroup,
                assetTreeContextMenuGroup,
                objectTreeContextMenuGroup
            ]
        });
    }

    setDirty(dirty) {
        if(this.dirty !== dirty) {
            this.dirty = dirty;

            if(dirty) {
                this.panel.setTitle(t("plugin_pimcore_perspectiveeditor_perspective_editor") + ' *');
            } else {
                this.panel.setTitle(t("plugin_pimcore_perspectiveeditor_perspective_editor"));
            }
        }
    }
}
