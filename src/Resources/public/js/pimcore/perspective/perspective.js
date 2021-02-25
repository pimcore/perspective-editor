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

pimcore.registerNS('pimcore.bundle.perspectiveeditor.PerspectiveEditor');

pimcore.bundle.perspectiveeditor.PerspectiveEditor = class {

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
                                                    id: pimcore.bundle.perspectiveeditor.PerspectiveViewHelper.generateUuid(),
                                                    text: value,
                                                    name: value,
                                                    type: 'perspective',
                                                    icon: '/bundles/pimcoreadmin/img/flat-color-icons/reading.svg',
                                                    expanded: true,
                                                    children: [
                                                        {
                                                            id: pimcore.bundle.perspectiveeditor.PerspectiveViewHelper.generateUuid(),
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
                                                            id: pimcore.bundle.perspectiveeditor.PerspectiveViewHelper.generateUuid(),
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
                                                            id: pimcore.bundle.perspectiveeditor.PerspectiveViewHelper.generateUuid(),
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
                                                            id: pimcore.bundle.perspectiveeditor.PerspectiveViewHelper.generateUuid(),
                                                            text: t('plugin_pimcore_perspectiveeditor_dashboard'),
                                                            type: 'dashboard',
                                                            leaf: true,
                                                            icon: '/bundles/pimcoreadmin/img/flat-color-icons/dashboard.svg',
                                                            config: [],
                                                        },
                                                        {
                                                            id: pimcore.bundle.perspectiveeditor.PerspectiveViewHelper.generateUuid(),
                                                            text: t('plugin_pimcore_perspectiveeditor_toolbar'),
                                                            type: 'toolbar',
                                                            leaf: true,
                                                            icon: '/bundles/pimcoreadmin/img/flat-color-icons/support.svg',
                                                            config: {},
                                                        },
                                                    ]
                                                });
                                                this.setDirty(true);
                                                pimcore.bundle.perspectiveeditor.PerspectiveViewHelper.reloadTreeNode(this.perspectiveTreeStore.getRoot().lastChild);
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
                        pimcore.bundle.perspectiveeditor.PerspectiveViewHelper.reloadTreeNode(record);
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
                pimcore.bundle.perspectiveeditor.PerspectiveViewHelper.reloadTreeNode(record);
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
            case 'icon': this.perspectiveEditPanel.add(pimcore.bundle.perspectiveeditor.PerspectiveViewHelper.createIconFormPanel(record, pimcore.bundle.perspectiveeditor.PerspectiveViewHelper.generateUuid(), false, this.setDirty.bind(this, true))); break;
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
            file: pimcore.bundle.perspectiveeditor.MenuItemPermissionHelper.loadPermissions('toolbar', 'file'),
            marketing: pimcore.bundle.perspectiveeditor.MenuItemPermissionHelper.loadPermissions('toolbar', 'marketing'),
            extras: pimcore.bundle.perspectiveeditor.MenuItemPermissionHelper.loadPermissions('toolbar', 'extras'),
            settings: pimcore.bundle.perspectiveeditor.MenuItemPermissionHelper.loadPermissions('toolbar', 'settings'),
            search: pimcore.bundle.perspectiveeditor.MenuItemPermissionHelper.loadPermissions('toolbar', 'search')
        };
        pimcore.bundle.perspectiveeditor.PerspectiveViewHelper.checkAndCreateDataStructure(config, structure);

        let fileMenuItems = [];
        pimcore.bundle.perspectiveeditor.PerspectiveViewHelper.generateCheckboxesForStructure(config.file, fileMenuItems, this.setDirty.bind(this, true), 'plugin_pimcore_perspectiveeditor_menu_file');

        let marketingMenuItems = [];
        pimcore.bundle.perspectiveeditor.PerspectiveViewHelper.generateCheckboxesForStructure(config.marketing, marketingMenuItems, this.setDirty.bind(this, true), 'plugin_pimcore_perspectiveeditor_menu_marketing');

        let extrasMenuItems = [];
        pimcore.bundle.perspectiveeditor.PerspectiveViewHelper.generateCheckboxesForStructure(config.extras, extrasMenuItems, this.setDirty.bind(this, true), 'plugin_pimcore_perspectiveeditor_menu_extras');

        let settingsMenuItems = [];
        pimcore.bundle.perspectiveeditor.PerspectiveViewHelper.generateCheckboxesForStructure(config.settings, settingsMenuItems, this.setDirty.bind(this, true), 'plugin_pimcore_perspectiveeditor_menu_settings');

        let searchMenuItems = [];
        pimcore.bundle.perspectiveeditor.PerspectiveViewHelper.generateCheckboxesForStructure(config.search, searchMenuItems, this.setDirty.bind(this, true), 'plugin_pimcore_perspectiveeditor_menu_search');


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
                            items: fileMenuItems
                        }),
                        new Ext.form.FieldSet({
                            title: t('plugin_pimcore_perspectiveeditor_extras'),
                            collapsible: true,
                            items: extrasMenuItems
                        }),
                        new Ext.form.FieldSet({
                            title: t('plugin_pimcore_perspectiveeditor_marketing'),
                            collapsible: true,
                            items: marketingMenuItems
                        }),
                        new Ext.form.FieldSet({
                            title: t('plugin_pimcore_perspectiveeditor_settings'),
                            items: settingsMenuItems
                        }),
                        new Ext.form.FieldSet({
                            title: t('plugin_pimcore_perspectiveeditor_search'),
                            collapsible: true,
                            items: searchMenuItems
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

        const structure = {
            document: pimcore.bundle.perspectiveeditor.MenuItemPermissionHelper.loadPermissions('customViewContextMenu', 'document'),
            asset: pimcore.bundle.perspectiveeditor.MenuItemPermissionHelper.loadPermissions('customViewContextMenu', 'asset'),
            object: pimcore.bundle.perspectiveeditor.MenuItemPermissionHelper.loadPermissions('customViewContextMenu', 'object')
        };

        pimcore.bundle.perspectiveeditor.PerspectiveViewHelper.checkAndCreateDataStructure(config.treeContextMenu, structure);

        let documentContextMenuItems = [];
        pimcore.bundle.perspectiveeditor.PerspectiveViewHelper.generateCheckboxesForStructure(config.treeContextMenu.document, documentContextMenuItems, this.setDirty.bind(this, true), 'plugin_pimcore_perspectiveeditor_document');


        var documentTreeContextMenuGroup = new Ext.form.FieldSet({
            title: t('plugin_pimcore_perspectiveeditor_document') + ' - ' + t('plugin_pimcore_perspectiveeditor_contextmenu'),
            hidden: config.type !== 'documents',
            margin: '30 10 0',
            width: 500,
            items: documentContextMenuItems
        });

        let assetContextMenuItems = [];
        pimcore.bundle.perspectiveeditor.PerspectiveViewHelper.generateCheckboxesForStructure(config.treeContextMenu.asset, assetContextMenuItems, this.setDirty.bind(this, true), 'plugin_pimcore_perspectiveeditor_asset');

        var assetTreeContextMenuGroup = new Ext.form.FieldSet({
            title: t('plugin_pimcore_perspectiveeditor_asset') + ' - ' + t('plugin_pimcore_perspectiveeditor_contextmenu'),
            hidden: config.type !== 'assets',
            margin: '30 10 0',
            width: 500,
            items: assetContextMenuItems
        });

        let objectContextMenuItems = [];
        pimcore.bundle.perspectiveeditor.PerspectiveViewHelper.generateCheckboxesForStructure(config.treeContextMenu.object, objectContextMenuItems, this.setDirty.bind(this, true), 'plugin_pimcore_perspectiveeditor_object');

        var objectTreeContextMenuGroup = new Ext.form.FieldSet({
            title: t('plugin_pimcore_perspectiveeditor_object') + ' - ' + t('plugin_pimcore_perspectiveeditor_contextmenu'),
            hidden: config.type !== 'objects',
            margin: '30 10 0',
            width: 500,
            items: objectContextMenuItems
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
                            pimcore.bundle.perspectiveeditor.PerspectiveViewHelper.reloadTreeNode(record);
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
