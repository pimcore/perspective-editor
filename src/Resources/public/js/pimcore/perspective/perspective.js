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
                },
            });

            this.panel = new Ext.Panel({
                title: t('plugin_pimcore_perspectiveeditor_perspective_editor'),
                iconCls: 'pimcore_icon_routes',
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
                        tbar: {
                            cls: 'pimcore_toolbar_border_bottom',
                            items: [
                                '->',
                                new Ext.Button({
                                    text: t("plugin_pimcore_perspectiveeditor_add_perspective"),
                                    iconCls: "pimcore_icon_plus",
                                    handler: function(){
                                        this.perspectiveTreeStore.getRoot().appendChild({
                                            id: PerspectiveViewHelper.generateUuid(),
                                            text: t('plugin_pimcore_perspectiveeditor_new_perspective'),
                                            type: 'perspective',
                                            icon: '/bundles/pimcoreadmin/img/flat-color-icons/integrated_webcam.svg',
                                            expanded: true,
                                            children: [
                                                {
                                                    id: PerspectiveViewHelper.generateUuid(),
                                                    text: t('plugin_pimcore_perspectiveeditor_icon'),
                                                    type: 'icon',
                                                    leaf: true,
                                                    icon: '/bundles/pimcoreadmin/img/flat-color-icons/asset.svg',
                                                    config: {
                                                        iconCls: null,
                                                        icon: null,
                                                    },
                                                },
                                                {
                                                    id: PerspectiveViewHelper.generateUuid(),
                                                    text: t('plugin_pimcore_perspectiveeditor_elementTree'),
                                                    type: 'elementTree',
                                                    leaf: true,
                                                    icon: '/bundles/pimcoreadmin/img/flat-color-icons/asset.svg',
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
                                                    icon: '/bundles/pimcoreadmin/img/flat-color-icons/star.svg',
                                                    config: [],
                                                },
                                                {
                                                    id: PerspectiveViewHelper.generateUuid(),
                                                    text: t('plugin_pimcore_perspectiveeditor_toolbar'),
                                                    type: 'toolbar',
                                                    leaf: true,
                                                    icon: '/bundles/pimcoreadmin/img/flat-color-icons/support.svg',
                                                    config: [],
                                                },
                                            ]
                                        });
                                        PerspectiveViewHelper.reloadTreeNode(this.perspectiveTreeStore.getRoot().lastChild);
                                    }.bind(this)
                                }),
                            ],
                        },
                    }),
                    this.perspectiveEditPanel
                ],
                bbar: new Ext.toolbar.Toolbar({
                    style: 'background: #e0e1e2',
                    items: [
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
                                        }
                                    }.bind(this)
                                });
                            }.bind(this)
                        }),
                        new Ext.Button({
                            text: t("save"),
                            iconCls: "pimcore_icon_save",
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
                                            this.perspectiveTreeStore.reload();
                                            this.perspectiveEditPanel.removeAll();
                                        } else {
                                            pimcore.helpers.showNotification(t("error"), t(responseObject.error), "error");
                                        }
                                    }.bind(this)
                                });
                            }.bind(this)
                        }),
                    ],
                }),
            });
        }

        return this.panel;
    }

    buildPerspectiveContextMenuItems (record){
        const items = [];

        if(record.data.type === 'elementTree'){
            items.push(this.buildAddDialog(record));
        }
        if(record.data.type === 'perspective' && record.data.text !== 'default'){
            items.push(this.buildRenameDialog(record));
            items.push(this.buildDeleteDialog(record));
        }
        if(record.data.type === 'elementTreeElement'){
            items.push(this.buildDeleteDialog(record));
        }
        if(record.data.type === 'dashboard'){
            items.push(this.buildAddDialog(record));
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
                    }
                }.bind(this), this, false, record.data.text);
            }.bind(this)
        });
    }

    buildAddDialog (record){
        return Ext.menu.Item({
            text: t('plugin_pimcore_perspectiveeditor_add'),
            iconCls: 'pimcore_icon_add',
            handler: function(){
                switch (record.data.type){
                    case 'elementTree': this.addElementTree(record); break;
                    case 'dashboard': this.addDashboard(record); break;
                }
                PerspectiveViewHelper.reloadTreeNode(record);
            }.bind(this)
        });
    }

    addElementTree (parent) {
        parent.appendChild({
            text: 'documents',
            type: 'elementTreeElement',
            leaf: true,
            iconCls: 'pimcore_icon_document',
            config: {
                type: 'documents',
                position: 'left',
                sort: 0,
            },
        });
    }

    addDashboard (parent) {
        const colDefault = {
            type: '-',
            config: null,
        }

        parent.appendChild({
            text: t('plugin_pimcore_perspectiveeditor_new_dashboard_definition'),
            type: 'dashboardDefinition',
            leaf: true,
            iconCls: 'pimcore_icon_gridconfig_operator_renderer',
            config: {
                positions: [
                    [colDefault],
                    [colDefault],
                ]
            }
        });
    }

    buildDeleteDialog (record){
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
                            record.parentNode.removeChild(record);
                        }
                    }.bind(this)
                });
            }.bind(this)
        });
    }

    buildPerspectiveEditorPanel (record){
        this.perspectiveEditPanel.removeAll();
        switch(record.data.type){
            case 'icon': this.perspectiveEditPanel.add(PerspectiveViewHelper.createIconFormPanel(record, PerspectiveViewHelper.generateUuid())); break;
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
            file: ['hidden', 'perspectives', 'dashboards', 'openDocument', 'openAsset', 'openObject', 'searchReplace', 'schedule', 'seemode', 'closeAll', 'help', 'about'],
            marketing: ['hidden', 'reports', 'tagmanagement', 'targeting', 'seo.hidden', 'seo.documents', 'seo.robots', 'seo.httperrors'],
            extras: ['hidden', 'glossary', 'redirects', 'translations', 'recyclebin', 'plugins', 'notesEvents', 'applicationlog', 'gdpr_data_extractor', 'emails', 'maintenance', 'systemtools.hidden', 'systemtools.phpinfo', 'systemtools.opcache', 'systemtools.requirements', 'systemtools.serverinfo', 'systemtools.database', 'systemtools.fileexplorer'],
            settings: ['hidden', 'documentTypes', 'predefinedProperties', 'predefinedMetadata', 'system', 'website', 'web2print', 'users.hidden', 'users.users', 'users.roles', 'thumbnails', 'objects.hidden', 'objects.classes', 'objects.fieldcollections', 'objects.objectbricks', 'objects.quantityValue', 'objects.classificationstore', 'objects.bulkExport', 'objects.bulkImport', 'routes', 'cache.hidden', 'cache.clearAll', 'cache.clearData', 'cache.clearSymfony', 'cache.clearOutput', 'cache.clearTemp', 'cache.generatePreviews', 'adminTranslations', 'tagConfiguration'],
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
                                PerspectiveViewHelper.generateCheckbox(t('file_menu_hidden'), config.file, 'hidden'),
                                PerspectiveViewHelper.generateCheckbox(t('file_menu_perspectives'), config.file, 'perspectives'),
                                PerspectiveViewHelper.generateCheckbox(t('file_menu_dashboards'), config.file, 'dashboards'),
                                PerspectiveViewHelper.generateCheckbox(t('file_menu_openDocument'), config.file, 'openDocument'),
                                PerspectiveViewHelper.generateCheckbox(t('file_menu_openAsset'), config.file, 'openAsset'),
                                PerspectiveViewHelper.generateCheckbox(t('file_menu_openObject'), config.file, 'openObject'),
                                PerspectiveViewHelper.generateCheckbox(t('file_menu_searchReplace'), config.file, 'searchReplace'),
                                PerspectiveViewHelper.generateCheckbox(t('file_menu_schedule'), config.file, 'schedule'),
                                PerspectiveViewHelper.generateCheckbox(t('file_menu_seemode'), config.file, 'seemode'),
                                PerspectiveViewHelper.generateCheckbox(t('file_menu_closeAll'), config.file, 'closeAll'),
                                PerspectiveViewHelper.generateCheckbox(t('file_menu_help'), config.file, 'help'),
                                PerspectiveViewHelper.generateCheckbox(t('file_menu_about'), config.file, 'about')
                            ]
                        }),
                        new Ext.form.FieldSet({
                            title: t('plugin_pimcore_perspectiveeditor_extras'),
                            collapsible: true,
                            items: [
                                PerspectiveViewHelper.generateCheckbox(t('extra_menu_hidden'), config.extras, 'hidden'),
                                PerspectiveViewHelper.generateCheckbox(t('extra_menu_glossary'), config.extras, 'glossary'),
                                PerspectiveViewHelper.generateCheckbox(t('extra_menu_redirects'), config.extras, 'redirects'),
                                PerspectiveViewHelper.generateCheckbox(t('extra_menu_translations'), config.extras, 'translations'),
                                PerspectiveViewHelper.generateCheckbox(t('extra_menu_recyclebin'), config.extras, 'recyclebin'),
                                PerspectiveViewHelper.generateCheckbox(t('extra_menu_plugins'), config.extras, 'plugins'),
                                PerspectiveViewHelper.generateCheckbox(t('extra_menu_notesEvents'), config.extras, 'notesEvents'),
                                PerspectiveViewHelper.generateCheckbox(t('extra_menu_applicationlog'), config.extras, 'applicationlog'),
                                PerspectiveViewHelper.generateCheckbox(t('extra_menu_gdpr_data_extractor'), config.extras, 'gdpr_data_extractor'),
                                PerspectiveViewHelper.generateCheckbox(t('extra_menu_emails'), config.extras, 'emails'),
                                PerspectiveViewHelper.generateCheckbox(t('extra_menu_maintenance'), config.extras, 'maintenance'),
                                PerspectiveViewHelper.generateCheckbox(t('extra_menu_systemtools_hidden'), config.extras.systemtools, 'hidden'),
                                PerspectiveViewHelper.generateCheckbox(t('extra_menu_systemtools_phpinfo'), config.extras.systemtools, 'phpinfo'),
                                PerspectiveViewHelper.generateCheckbox(t('extra_menu_systemtools_opcache'), config.extras.systemtools, 'opcache'),
                                PerspectiveViewHelper.generateCheckbox(t('extra_menu_systemtools_requirements'), config.extras.systemtools, 'requirements'),
                                PerspectiveViewHelper.generateCheckbox(t('extra_menu_systemtools_serverinfo'), config.extras.systemtools, 'serverinfo'),
                                PerspectiveViewHelper.generateCheckbox(t('extra_menu_systemtools_database'), config.extras.systemtools, 'database'),
                                PerspectiveViewHelper.generateCheckbox(t('extra_menu_systemtools_fileexplorer'), config.extras.systemtools, 'fileexplorer')
                            ]
                        }),
                        new Ext.form.FieldSet({
                            title: t('plugin_pimcore_perspectiveeditor_marketing'),
                            collapsible: true,
                            items: [
                                PerspectiveViewHelper.generateCheckbox(t('marketing_menu_hidden'), config.marketing, 'hidden'),
                                PerspectiveViewHelper.generateCheckbox(t('marketing_menu_reports'), config.marketing, 'reports'),
                                PerspectiveViewHelper.generateCheckbox(t('marketing_menu_tagmanagement'), config.marketing, 'tagmanagement'),
                                PerspectiveViewHelper.generateCheckbox(t('marketing_menu_targeting'), config.marketing, 'targeting'),
                                PerspectiveViewHelper.generateCheckbox(t('marketing_menu_seo_hidden'), config.marketing.seo, 'hidden'),
                                PerspectiveViewHelper.generateCheckbox(t('marketing_menu_seo_documents'), config.marketing.seo, 'documents'),
                                PerspectiveViewHelper.generateCheckbox(t('marketing_menu_seo_robots'), config.marketing.seo, 'robots'),
                                PerspectiveViewHelper.generateCheckbox(t('marketing_menu_seo_httperrors'), config.marketing.seo, 'httperrors')
                            ]
                        }),
                        new Ext.form.FieldSet({
                            title: t('plugin_pimcore_perspectiveeditor_settings'),
                            items: [
                                PerspectiveViewHelper.generateCheckbox(t('settings_menu_hidden'), config.settings, 'hidden'),
                                PerspectiveViewHelper.generateCheckbox(t('settings_menu_documentTypes'), config.settings, 'documentTypes'),
                                PerspectiveViewHelper.generateCheckbox(t('settings_menu_predefinedProperties'), config.settings, 'predefinedProperties'),
                                PerspectiveViewHelper.generateCheckbox(t('settings_menu_predefinedMetadata'), config.settings, 'predefinedMetadata'),
                                PerspectiveViewHelper.generateCheckbox(t('settings_menu_system'), config.settings, 'system'),
                                PerspectiveViewHelper.generateCheckbox(t('settings_menu_website'), config.settings, 'website'),
                                PerspectiveViewHelper.generateCheckbox(t('settings_menu_web2print'), config.settings, 'web2print'),
                                PerspectiveViewHelper.generateCheckbox(t('settings_menu_users_hidden'), config.settings.users, 'hidden'),
                                PerspectiveViewHelper.generateCheckbox(t('settings_menu_users_users'), config.settings.users, 'users'),
                                PerspectiveViewHelper.generateCheckbox(t('settings_menu_users_roles'), config.settings.users, 'roles'),
                                PerspectiveViewHelper.generateCheckbox(t('settings_menu_thumbnails'), config.settings, 'thumbnails'),
                                PerspectiveViewHelper.generateCheckbox(t('settings_menu_objects_hidden'), config.settings.objects, 'hidden'),
                                PerspectiveViewHelper.generateCheckbox(t('settings_menu_objects_classes'), config.settings.objects, 'classes'),
                                PerspectiveViewHelper.generateCheckbox(t('settings_menu_objects_fieldcollections'), config.settings.objects, 'fieldcollections'),
                                PerspectiveViewHelper.generateCheckbox(t('settings_menu_objects_objectbricks'), config.settings.objects, 'objectbricks'),
                                PerspectiveViewHelper.generateCheckbox(t('settings_menu_objects_quantityValue'), config.settings.objects, 'quantityValue'),
                                PerspectiveViewHelper.generateCheckbox(t('settings_menu_objects_classificationstore'), config.settings.objects, 'classificationstore'),
                                PerspectiveViewHelper.generateCheckbox(t('settings_menu_objects_bulkExport'), config.settings.objects, 'bulkExport'),
                                PerspectiveViewHelper.generateCheckbox(t('settings_menu_objects_bulkImport'), config.settings.objects, 'bulkImport'),
                                PerspectiveViewHelper.generateCheckbox(t('settings_menu_routes'), config.settings, 'routes'),
                                PerspectiveViewHelper.generateCheckbox(t('settings_menu_cache_hidden'), config.settings.cache, 'hidden'),
                                PerspectiveViewHelper.generateCheckbox(t('settings_menu_cache_clearAll'), config.settings.cache, 'clearAll'),
                                PerspectiveViewHelper.generateCheckbox(t('settings_menu_cache_clearData'), config.settings.cache, 'clearData'),
                                PerspectiveViewHelper.generateCheckbox(t('settings_menu_cache_clearSymfony'), config.settings.cache, 'clearSymfony'),
                                PerspectiveViewHelper.generateCheckbox(t('settings_menu_cache_clearOutput'), config.settings.cache, 'clearOutput'),
                                PerspectiveViewHelper.generateCheckbox(t('settings_menu_cache_clearTemp'), config.settings.cache, 'clearTemp'),
                                PerspectiveViewHelper.generateCheckbox(t('settings_menu_cache_generatePreviews'), config.settings.cache, 'generatePreviews'),
                                PerspectiveViewHelper.generateCheckbox(t('settings_menu_adminTranslations'), config.settings, 'adminTranslations'),
                                PerspectiveViewHelper.generateCheckbox(t('settings_menu_tagConfiguration'), config.settings, 'tagConfiguration')
                            ]
                        }),
                        new Ext.form.FieldSet({
                            title: t('plugin_pimcore_perspectiveeditor_search'),
                            collapsible: true,
                            items: [
                                PerspectiveViewHelper.generateCheckbox(t('search_menu_hidden'), config.search, 'hidden'),
                                PerspectiveViewHelper.generateCheckbox(t('search_menu_documents'), config.search.items, 'documents'),
                                PerspectiveViewHelper.generateCheckbox(t('search_menu_assets'), config.search.items, 'assets'),
                                PerspectiveViewHelper.generateCheckbox(t('search_menu_objects'), config.search.items, 'objects')
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
            data: gridData
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
                    }
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
                }
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
                PerspectiveViewHelper.generateCheckbox(t('add'), config.treeContextMenu.document.items, 'add'),
                PerspectiveViewHelper.generateCheckbox(t('addSnippet'), config.treeContextMenu.document.items, 'addSnippet'),
                PerspectiveViewHelper.generateCheckbox(t('addLink'), config.treeContextMenu.document.items, 'addLink'),
                PerspectiveViewHelper.generateCheckbox(t('addEmail'), config.treeContextMenu.document.items, 'addEmail'),
                PerspectiveViewHelper.generateCheckbox(t('addNewsletter'), config.treeContextMenu.document.items, 'addNewsletter'),
                PerspectiveViewHelper.generateCheckbox(t('addHardlink'), config.treeContextMenu.document.items, 'addHardlink'),
                PerspectiveViewHelper.generateCheckbox(t('addFolder'), config.treeContextMenu.document.items, 'addFolder'),
                PerspectiveViewHelper.generateCheckbox(t('paste'), config.treeContextMenu.document.items, 'paste'),
                PerspectiveViewHelper.generateCheckbox(t('pasteCut'), config.treeContextMenu.document.items, 'pasteCut'),
                PerspectiveViewHelper.generateCheckbox(t('copy'), config.treeContextMenu.document.items, 'copy'),
                PerspectiveViewHelper.generateCheckbox(t('cut'), config.treeContextMenu.document.items, 'cut'),
                PerspectiveViewHelper.generateCheckbox(t('rename'), config.treeContextMenu.document.items, 'rename'),
                PerspectiveViewHelper.generateCheckbox(t('unpublish'), config.treeContextMenu.document.items, 'unpublish'),
                PerspectiveViewHelper.generateCheckbox(t('publish'), config.treeContextMenu.document.items, 'publish'),
                PerspectiveViewHelper.generateCheckbox(t('delete'), config.treeContextMenu.document.items, 'delete'),
                PerspectiveViewHelper.generateCheckbox(t('open'), config.treeContextMenu.document.items, 'open'),
                PerspectiveViewHelper.generateCheckbox(t('convert'), config.treeContextMenu.document.items, 'convert'),
                PerspectiveViewHelper.generateCheckbox(t('searchAndMove'), config.treeContextMenu.document.items, 'searchAndMove'),
                PerspectiveViewHelper.generateCheckbox(t('useAsSite'), config.treeContextMenu.document.items, 'useAsSite'),
                PerspectiveViewHelper.generateCheckbox(t('editSite'), config.treeContextMenu.document.items, 'editSite'),
                PerspectiveViewHelper.generateCheckbox(t('removeSite'), config.treeContextMenu.document.items, 'removeSite'),
                PerspectiveViewHelper.generateCheckbox(t('lock'), config.treeContextMenu.document.items, 'lock'),
                PerspectiveViewHelper.generateCheckbox(t('unlock'), config.treeContextMenu.document.items, 'unlock'),
                PerspectiveViewHelper.generateCheckbox(t('lockAndPropagate'), config.treeContextMenu.document.items, 'lockAndPropagate'),
                PerspectiveViewHelper.generateCheckbox(t('unlockAndPropagate'), config.treeContextMenu.document.items, 'unlockAndPropagate'),
                PerspectiveViewHelper.generateCheckbox(t('reload'), config.treeContextMenu.document.items, 'reload')
            ]
        });

        var assetTreeContextMenuGroup = new Ext.form.FieldSet({
            title: t('asset') + ' - ' + t('contextmenu'),
            hidden: config.type !== 'assets',
            margin: '30 10 0',
            width: 500,
            items: [
                PerspectiveViewHelper.generateCheckbox(t('upload'), config.treeContextMenu.asset.items.add.items, 'upload'),
                PerspectiveViewHelper.generateCheckbox(t('uploadFromUrl'), config.treeContextMenu.asset.items.add.items, 'uploadFromUrl'),
                PerspectiveViewHelper.generateCheckbox(t('addFolder'), config.treeContextMenu.asset.items, 'addFolder'),
                PerspectiveViewHelper.generateCheckbox(t('rename'), config.treeContextMenu.asset.items, 'rename'),
                PerspectiveViewHelper.generateCheckbox(t('paste'), config.treeContextMenu.asset.items, 'paste'),
                PerspectiveViewHelper.generateCheckbox(t('pasteCut'), config.treeContextMenu.asset.items, 'pasteCut'),
                PerspectiveViewHelper.generateCheckbox(t('delete'), config.treeContextMenu.asset.items, 'delete'),
                PerspectiveViewHelper.generateCheckbox(t('searchAndMove'), config.treeContextMenu.asset.items, 'searchAndMove'),
                PerspectiveViewHelper.generateCheckbox(t('lock'), config.treeContextMenu.asset.items, 'lock'),
                PerspectiveViewHelper.generateCheckbox(t('unlock'), config.treeContextMenu.asset.items, 'unlock'),
                PerspectiveViewHelper.generateCheckbox(t('lockAndPropagate'), config.treeContextMenu.asset.items, 'lockAndPropagate'),
                PerspectiveViewHelper.generateCheckbox(t('unlockAndPropagate'), config.treeContextMenu.asset.items, 'unlockAndPropagate'),
                PerspectiveViewHelper.generateCheckbox(t('hide_reload'), config.treeContextMenu.asset.items.reload, 'hidden', true)
            ]
        });

        var objectTreeContextMenuGroup = new Ext.form.FieldSet({
            title: t('object') + ' - ' + t('contextmenu'),
            hidden: config.type !== 'objects',
            margin: '30 10 0',
            width: 500,
            items: [
                PerspectiveViewHelper.generateCheckbox(t('add object'), config.treeContextMenu.object.items, 'add'),
                PerspectiveViewHelper.generateCheckbox(t('add folder'), config.treeContextMenu.object.items, 'addFolder'),
                PerspectiveViewHelper.generateCheckbox(t('import csv'), config.treeContextMenu.object.items, 'importCsv'),
                PerspectiveViewHelper.generateCheckbox(t('cut'), config.treeContextMenu.object.items, 'cut'),
                PerspectiveViewHelper.generateCheckbox(t('copy'), config.treeContextMenu.object.items, 'copy'),
                PerspectiveViewHelper.generateCheckbox(t('delete'), config.treeContextMenu.object.items, 'delete'),
                PerspectiveViewHelper.generateCheckbox(t('rename'), config.treeContextMenu.object.items, 'rename'),
                PerspectiveViewHelper.generateCheckbox(t('reload'), config.treeContextMenu.object.items, 'reload'),
                PerspectiveViewHelper.generateCheckbox(t('search and move'), config.treeContextMenu.object.items, 'searchAndMove'),
                PerspectiveViewHelper.generateCheckbox(t('lock'), config.treeContextMenu.object.items, 'lock'),
                PerspectiveViewHelper.generateCheckbox(t('unlock'), config.treeContextMenu.object.items, 'unlock'),
                PerspectiveViewHelper.generateCheckbox(t('lockAndPropagate'), config.treeContextMenu.object.items, 'lockAndPropagate'),
                PerspectiveViewHelper.generateCheckbox(t('unlockAndPropagate'), config.treeContextMenu.object.items, 'unlockAndPropagate'),
                PerspectiveViewHelper.generateCheckbox(t('sorting'), config.treeContextMenu.object.items, 'changeChildrenSortBy')
            ]
        });

        return new Ext.form.Panel({
            title: t('plugin_pimcore_perspectiveeditor_tree_element_selection'),
            icon: '/bundles/pimcoreadmin/img/flat-color-icons/parallel_tasks.svg',
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
                        }
                    }
                }),
                customViewComboBox,
                new Ext.form.ComboBox({
                    padding: 10,
                    fieldLabel: t('plugin_pimcore_perspectiveeditor_position'),
                    displayField: 'name',
                    valueField: 'position',
                    name: 'position',
                    editable: false,
                    value: config.position,
                    store: new Ext.data.Store({
                        fields: ['name', 'position'],
                        data: [{name: t('plugin_pimcore_perspectiveeditor_left'), position: 'left'}, {name: t('plugin_pimcore_perspectiveeditor_right'), position: 'right'}]
                    }),
                    listeners: {
                        change: function(elem, newValue, oldValue){
                            config.position = newValue;
                        }
                    }
                }),
                new Ext.form.NumberField({
                    padding: 10,
                    fieldLabel: t('plugin_pimcore_perspectiveeditor_sort'),
                    value: config.sort,
                    listeners:{
                        change: function(elem, newValue, oldValue){
                            config.sort = newValue;
                        }
                    }
                }),
                documentTreeContextMenuGroup,
                assetTreeContextMenuGroup,
                objectTreeContextMenuGroup
            ]
        });
    }
}
