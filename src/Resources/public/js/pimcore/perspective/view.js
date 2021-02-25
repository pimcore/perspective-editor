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

pimcore.registerNS('pimcore.bundle.perspectiveeditor.ViewEditor');

pimcore.bundle.perspectiveeditor.ViewEditor = class {

    routePrefix = '/admin/perspectives-views/view';
    activeRecordId = null;

    constructor (readOnly) {
        if (!this.panel) {
            this.readOnly = readOnly;

            this.viewEditPanel = new Ext.Panel({
                region: 'center',
                width: '75%',
                autoScroll: true,
                padding: 10
            });

            this.viewTreeStore = new Ext.data.TreeStore({
                autoLoad: true,
                proxy: {
                    type: 'ajax',
                    url: this.routePrefix + '/get-tree',
                    reader: {
                        type: 'json'
                    }
                },
                listeners: {
                    datachanged: function(treestore){
                        let availableViewsStoreData = [];
                        const viewData = treestore.getRoot().serialize();
                        if(viewData.children) {
                            availableViewsStoreData = viewData.children.map(function(view){
                                return {id: view.id, name: view.config.name + ' (type: ' + view.config.treetype + ', folder: ' + view.config.rootfolder +')'};
                            });
                        }
                        const availableViewsStore = Ext.getStore('availableViewsStore');
                        availableViewsStore.setData(availableViewsStoreData);
                    }.bind(this),
                },
            });

            let toolbarButtons = [];
            let bottomButtons = [
                "->",
                new Ext.Button({
                    text: t("reload"),
                    iconCls: "pimcore_icon_reload",
                    handler: function(){
                        Ext.MessageBox.show({
                            title:t('plugin_pimcore_perspectiveeditor_are_you_sure'),
                            msg: t('plugin_pimcore_perspectiveeditor_confirm_reload'),
                            buttons: Ext.Msg.OKCANCEL ,
                            icon: Ext.MessageBox.INFO ,
                            fn: function (button) {
                                if (button === 'ok') {
                                    this.viewTreeStore.reload();
                                    this.viewEditPanel.removeAll();
                                    this.setDirty(false);
                                }
                            }.bind(this)
                        });
                    }.bind(this)
                })
            ];

            if(!readOnly) {
                toolbarButtons.push(new Ext.Button({
                    text: t('plugin_pimcore_perspectiveeditor_add_view'),
                    iconCls: "pimcore_icon_plus",
                    handler: function () {
                        Ext.MessageBox.prompt(t('plugin_pimcore_perspectiveeditor_new_view'), t('plugin_pimcore_perspectiveeditor_new_view'), function (button, value) {
                            if (button === 'ok' && value.length > 0) {
                                const record = this.viewTreeStore.getRoot().appendChild({
                                    id: pimcore.bundle.perspectiveeditor.PerspectiveViewHelper.generateUuid(),
                                    text: value,
                                    type: 'view',
                                    icon: '/bundles/pimcoreadmin/img/flat-color-icons/view_details.svg',
                                    leaf: true,
                                    cls: 'plugin_pimcore_perspective_editor_custom_view_tree_item',
                                    config: {
                                        name: value,
                                        treetype: 'document',
                                        position: 'left',
                                        rootfolder: '/',
                                        showroot: false,
                                        sort: 0,
                                    }
                                });
                                this.buildViewEditorPanel(record);
                                this.setDirty(true);

                                pimcore.bundle.perspectiveeditor.PerspectiveViewHelper.reloadTreeNode(this.viewTreeStore.getRoot().lastChild);
                            }
                        }.bind(this))
                    }.bind(this)
                }));

                bottomButtons.push(new Ext.Button({
                    text: t('save'),
                    iconCls: "pimcore_icon_save",
                    handler: function(){
                        Ext.Ajax.request({
                            url: this.routePrefix + '/update',
                            params: {
                                data: Ext.JSON.encode(this.viewTreeStore.getRoot().serialize())
                            },
                            method: 'POST',
                            success: function(response){
                                const responseObject = Ext.decode(response.responseText);
                                if(responseObject.success){
                                    pimcore.helpers.showNotification(t("success"), t("saved_successfully"), "success");
                                    this.setDirty(false);
                                }
                                else{
                                    pimcore.helpers.showNotification(t("error"), responseObject.error, "error")
                                }
                            }.bind(this)
                        });
                    }.bind(this)
                }));
            }

            this.panel = new Ext.Panel({
                title: t("plugin_pimcore_perspectiveeditor_view_editor"),
                iconCls: "pimcore_icon_custom_views",
                border: false,
                layout: "border",
                items: [
                    new Ext.tree.Panel({
                        region: "west",
                        autoScroll: true,
                        animate: false,
                        containerScroll: true,
                        width: '25%',
                        split: true,
                        store: this.viewTreeStore,
                        rootVisible: false,
                        listeners: {
                            itemclick: function(tree, record){
                                this.buildViewEditorPanel(record);
                            }.bind(this),
                            itemcontextmenu: function (tree, record, item, index, e, eOpts ) {

                                e.stopEvent();
                                if(!readOnly) {
                                    var menu = new Ext.menu.Menu({
                                        items: [
                                            Ext.menu.Item({
                                                text: t('delete'),
                                                iconCls: "pimcore_icon_delete",
                                                handler: function(){
                                                    Ext.MessageBox.show({
                                                        title:t('plugin_pimcore_perspectiveeditor_are_you_sure'),
                                                        msg: t('plugin_pimcore_perspectiveeditor_all_content_will_be_lost'),
                                                        buttons: Ext.Msg.OKCANCEL ,
                                                        icon: Ext.MessageBox.INFO ,
                                                        fn: function (button) {
                                                            if (button === 'ok') {
                                                                if(record.id === this.activeRecordId) {
                                                                    this.viewEditPanel.removeAll();
                                                                }
                                                                record.parentNode.removeChild(record);
                                                                this.setDirty(true);
                                                            }
                                                        }.bind(this)
                                                    });
                                                }.bind(this)
                                            })
                                        ]
                                    });
                                    menu.showAt(e.pageX, e.pageY);
                                }
                            }.bind(this)
                        },
                        tbar: {
                            cls: 'pimcore_toolbar_border_bottom',
                            items: toolbarButtons,
                        },
                    }),
                    this.viewEditPanel
                ],
                buttons: bottomButtons
            });
        }

        return this.panel;
    }

    buildViewEditorPanel (record){
        if(record.data.type === 'view'){
            this.viewEditPanel.removeAll();
            this.activeRecordId = record.id;

            var items = [];
            items.push(new Ext.form.FieldSet({
                title: t('plugin_pimcore_perspectiveeditor_name'),
                items: this.createViewNamingPart(record)
            }));
            items.push(this.createSqlPart(record));
            items.push(...this.createViewContextMenuPart(record.data));

            items.push(Ext.create('Ext.form.FieldSet', {
                title: t('plugin_pimcore_perspectiveeditor_view_default_positioning'),
                items: this.createDefaultPositionPart(record)
            }));

            this.viewEditPanel.add(
                new Ext.form.Panel({
                    title: t('plugin_pimcore_perspectiveeditor_view_selection'),
                    iconCls: 'pimcore_icon_custom_views',
                    items: items
                })
            );
        }
    }

    createViewNamingPart (record){
        var data = record.data;
        var viewTypStore = new Ext.data.Store({
            fields: ['name', 'value'],
            data: [
                {name: 'document', value: 'document'},
                {name: 'asset', value: 'asset'},
                {name: 'object', value: 'object'},
            ]
        });

        var iconFormPanel = pimcore.bundle.perspectiveeditor.PerspectiveViewHelper.createIconFormPanel(record, pimcore.bundle.perspectiveeditor.PerspectiveViewHelper.generateUuid(), true);
        let iconItems = iconFormPanel.items.items.map(function(item){
            item.setMargin('');

            if(this.readOnly && item.setReadOnly) {
                item.setReadOnly(true);
            }

            return item;
        }.bind(this));

        return [
            new Ext.form.TextField({
                fieldLabel: t('plugin_pimcore_perspectiveeditor_name'),
                value: data.config.name,
                readOnly: this.readOnly,
                listeners: {
                    change: function(elem, newValue, oldValue){
                        data.config.name = newValue;
                        this.setDirty(true);
                    }.bind(this)
                }
            }),
            new Ext.form.ComboBox({
                store: viewTypStore,
                fieldLabel: t('plugin_pimcore_perspectiveeditor_type'),
                displayField: 'name',
                valueField: 'value',
                editable: false,
                value: data.config.treetype,
                readOnly: this.readOnly,
                listeners: {
                    change: function(elem, newValue, oldValue){
                        data.config.treetype = newValue;

                        if(newValue === 'document'){
                            this.documentTreeContextMenuGroup.show();
                            this.assetTreeContextMenuGroup.hide();
                            this.objectTreeContextMenuGroup.hide();
                        }
                        else if(newValue === 'asset'){
                            this.documentTreeContextMenuGroup.hide();
                            this.assetTreeContextMenuGroup.show();
                            this.objectTreeContextMenuGroup.hide();
                        }
                        else if(newValue === 'object'){
                            this.documentTreeContextMenuGroup.hide();
                            this.assetTreeContextMenuGroup.hide();
                            this.objectTreeContextMenuGroup.show();
                        }
                        this.setDirty(true);
                    }.bind(this)
                },
            }),
            {
                xtype: 'fieldcontainer',
                layout: 'hbox',
                fieldLabel: t('plugin_pimcore_perspectiveeditor_icon'),
                items: iconItems,
            },
            new Ext.form.TextField({
                fieldLabel: t('plugin_pimcore_perspectiveeditor_rootfolder'),
                value: data.config.rootfolder,
                fieldCls: "input_drop_target",
                width: 600,
                readOnly: this.readOnly,
                listeners: {
                    change: function() {
                        this.setDirty(true);
                    }.bind(this),
                    render: function (el) {
                        new Ext.dd.DropZone(el.getEl(), {
                            reference: this,
                            ddGroup: "element",
                            getTargetFromEvent: function(e) {
                                return this.getEl();
                            }.bind(el),

                            onNodeOver : function(target, dd, e, dragItemData) {
                                if (
                                    ((dragItemData.records.length === 1 && dragItemData.records[0].data.elementType === 'document' && in_array(dragItemData.records[0].data.type, ['page', 'folder'])) ||
                                        (dragItemData.records.length === 1 && dragItemData.records[0].data.elementType === 'asset' && in_array(dragItemData.records[0].data.type, ['folder'])) ||
                                        (dragItemData.records.length === 1 && dragItemData.records[0].data.elementType === 'object' && in_array(dragItemData.records[0].data.type, ['folder']))) &&
                                    dragItemData.records[0].data.elementType === data.config.treetype
                                ) {
                                    return Ext.dd.DropZone.prototype.dropAllowed;
                                }
                            },

                            onNodeDrop : function (target, dd, e, dragItemData) {
                                if(!pimcore.helpers.dragAndDropValidateSingleItem(dragItemData)) {
                                    return false;
                                }

                                dragItemData = dragItemData.records[0].data;
                                if (
                                    ((dragItemData.elementType === 'document' && in_array(dragItemData.type, ['page', 'folder'])) ||
                                        (dragItemData.elementType === 'asset' && in_array(dragItemData.type, ['folder'])) ||
                                        (dragItemData.elementType === 'object' && in_array(dragItemData.type, ['folder']))) &&
                                    dragItemData.elementType === data.config.treetype
                                ) {
                                    this.setValue(dragItemData.path);
                                    data.config.rootfolder = dragItemData.path;
                                    return true;
                                }
                                return false;
                            }.bind(el)
                        });
                    },
                },
            }),
            new Ext.form.ComboBox({
                fieldLabel: t('plugin_pimcore_perspectiveeditor_show_root'),
                displayField: 'name',
                valueField: 'show',
                editable: false,
                readOnly: this.readOnly,
                value: data.config.showroot,
                store: new Ext.data.Store({
                    fields: ['name', 'show'],
                    data: [{name: 'yes', show: true}, {name: 'no', show: false}]
                }),
                listeners: {
                    change: function(elem, newValue, oldValue){
                        data.config.showroot = newValue;
                        this.setDirty(true);
                    }.bind(this)
                },
            })
        ];
    }

    createDefaultPositionPart (record) {
        var data = record.data;

        return [
            new Ext.form.NumberField({
                fieldLabel: t('plugin_pimcore_perspectiveeditor_sort'),
                value: data.config.sort,
                readOnly: this.readOnly,
                listeners: {
                    change: function(elem, newValue, oldValue){
                        data.config.sort = newValue;
                        this.setDirty(true);
                    }.bind(this)
                },
            }),
            new Ext.form.ComboBox({
                fieldLabel: t('plugin_pimcore_perspectiveeditor_position'),
                displayField: 'name',
                valueField: 'position',
                name: 'position',
                editable: false,
                value: data.config.position,
                readOnly: this.readOnly,
                store: new Ext.data.Store({
                    fields: ['name', 'position'],
                    data: [{name: 'left', position: 'left'}, {name: 'right', position: 'right'}]
                }),
                listeners: {
                    change: function(elem, newValue, oldValue){
                        data.config.position = newValue;
                        this.setDirty(true);
                    }.bind(this)
                },
            })
        ];
    }

    createSqlPart (record){
        return new Ext.form.FieldSet({
            title: t('plugin_pimcore_perspectiveeditor_sql'),
            margin: '30 0',
            items: [
                new Ext.form.TextArea({
                    fieldLabel: t('plugin_pimcore_perspectiveeditor_sql_having'),
                    value: record.data.config.having,
                    readOnly: this.readOnly,
                    width: '80%',
                    listeners: {
                        change: function(elem, newValue, oldValue){
                            record.data.config.having = newValue;
                            this.setDirty(true);
                        }.bind(this)
                    },
                }),
                new Ext.form.TextArea({
                    fieldLabel: t('plugin_pimcore_perspectiveeditor_sql_where'),
                    value: record.data.config.where,
                    readOnly: this.readOnly,
                    width: '80%',
                    listeners: {
                        change: function(elem, newValue, oldValue){
                            record.data.config.where = newValue;
                            this.setDirty(true);
                        }.bind(this)
                    },
                }),
            ],
        });
    }

    createViewContextMenuPart (data){
        const structure = {
            document: pimcore.bundle.perspectiveeditor.MenuItemPermissionHelper.loadPermissions('customViewContextMenu', 'document'),
            asset: pimcore.bundle.perspectiveeditor.MenuItemPermissionHelper.loadPermissions('customViewContextMenu', 'asset'),
            object: pimcore.bundle.perspectiveeditor.MenuItemPermissionHelper.loadPermissions('customViewContextMenu', 'object')
        };

        var config = data.config;
        if(!config.treeContextMenu){
            config.treeContextMenu = {};
        }
        pimcore.bundle.perspectiveeditor.PerspectiveViewHelper.checkAndCreateDataStructure(config.treeContextMenu, structure);

        let documentContextMenuItems = [];
        pimcore.bundle.perspectiveeditor.PerspectiveViewHelper.generateCheckboxesForStructure(config.treeContextMenu.document, documentContextMenuItems, this.setDirty.bind(this, true), 'plugin_pimcore_perspectiveeditor_document', this.readOnly);

        this.documentTreeContextMenuGroup = new Ext.form.FieldSet({
            title: t('plugin_pimcore_perspectiveeditor_document') + ' - ' + t('plugin_pimcore_perspectiveeditor_contextmenu'),
            hidden: data.config.treetype !== 'document',
            margin: '30 0',
            items: documentContextMenuItems
        });

        let assetContextMenuItems = [];
        pimcore.bundle.perspectiveeditor.PerspectiveViewHelper.generateCheckboxesForStructure(config.treeContextMenu.asset, assetContextMenuItems, this.setDirty.bind(this, true), 'plugin_pimcore_perspectiveeditor_asset', this.readOnly);


        this.assetTreeContextMenuGroup = new Ext.form.FieldSet({
            title: t('plugin_pimcore_perspectiveeditor_asset') + ' - ' + t('plugin_pimcore_perspectiveeditor_contextmenu'),
            hidden: data.config.treetype !== 'asset',
            margin: '30 0',
            items: assetContextMenuItems
        });

        let objectContextMenuItems = [];
        pimcore.bundle.perspectiveeditor.PerspectiveViewHelper.generateCheckboxesForStructure(config.treeContextMenu.object, objectContextMenuItems, this.setDirty.bind(this, true), 'plugin_pimcore_perspectiveeditor_object', this.readOnly);

        this.objectTreeContextMenuGroup = new Ext.form.FieldSet({
            title: t('plugin_pimcore_perspectiveeditor_object') + ' - ' + t('plugin_pimcore_perspectiveeditor_contextmenu'),
            hidden: data.config.treetype !== 'object',
            margin: '30 0',
            items: objectContextMenuItems
        });

        return [
            this.documentTreeContextMenuGroup,
            this.assetTreeContextMenuGroup,
            this.objectTreeContextMenuGroup
        ];
    }

    setDirty(dirty) {
        if(this.dirty !== dirty) {
            this.dirty = dirty;

            if(dirty) {
                this.panel.setTitle(t("plugin_pimcore_perspectiveeditor_view_editor") + ' *');
            } else {
                this.panel.setTitle(t("plugin_pimcore_perspectiveeditor_view_editor"));
            }
        }
    }
}
