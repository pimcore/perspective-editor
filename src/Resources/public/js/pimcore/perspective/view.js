class ViewEditor{

    routePrefix = '/admin/perspectives-views/view';
    activeRecordId = null;

    constructor (perspectiveEditor) {
        if (!this.panel) {
            this.perspectiveEditor = perspectiveEditor;

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
                        const availableViewsStoreData = treestore.getRoot().serialize().children.map(function(view){
                            return {id: view.id, name: view.config.name + ' (type: ' + view.config.treetype + ', folder: ' + view.config.rootfolder +')'};
                        });
                        const availableViewsStore = Ext.getStore('availableViewsStore');
                        availableViewsStore.setData(availableViewsStoreData);
                    }.bind(this),
                },
            });

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
                            }.bind(this)
                        },
                        tbar: {
                            cls: 'pimcore_toolbar_border_bottom',
                            items: [
                                new Ext.Button({
                                    text: t('plugin_pimcore_perspectiveeditor_add_view'),
                                    iconCls: "pimcore_icon_plus",
                                    handler: function () {
                                        Ext.MessageBox.prompt(t('plugin_pimcore_perspectiveeditor_new_view'), t('plugin_pimcore_perspectiveeditor_new_view'), function (button, value) {
                                            if (button === 'ok' && value.length > 0) {
                                                const record = this.viewTreeStore.getRoot().appendChild({
                                                    id: PerspectiveViewHelper.generateUuid(),
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

                                                PerspectiveViewHelper.reloadTreeNode(this.viewTreeStore.getRoot().lastChild);
                                            }
                                        }.bind(this))
                                    }.bind(this)
                                }),
                            ],
                        },
                    }),
                    this.viewEditPanel
                ],
                buttons: [
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
                    }),
                    new Ext.Button({
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
                    })
                ]
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

        var iconFormPanel = PerspectiveViewHelper.createIconFormPanel(record, PerspectiveViewHelper.generateUuid(), true);
        let iconItems = iconFormPanel.items.items.map(function(item){
            item.setMargin('');
            return item;
        });

        return [
            new Ext.form.TextField({
                fieldLabel: t('plugin_pimcore_perspectiveeditor_name'),
                value: data.config.name,
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
            document: ['items.add', 'items.add', 'items.addSnippet', 'items.addLink', 'items.addEmail', 'items.addNewsletter', 'items.addHardlink', 'items.addFolder', 'items.paste', 'items.pasteCut', 'items.copy', 'items.cut', 'items.rename', 'items.unpublish', 'items.publish', 'items.delete', 'items.open', 'items.convert', 'items.searchAndMove', 'items.useAsSite', 'items.editSite', 'items.removeSite', 'items.lock', 'items.unlock', 'items.lockAndPropagate', 'items.unlockAndPropagate', 'items.reload'],
            asset: ['items.add.items.upload', 'items.add.items.uploadFromUrl', 'items.addFolder', 'items.rename', 'items.paste', 'items.pasteCut', 'items.delete', 'items.searchAndMove', 'items.lock', 'items.unlock', 'items.lockAndPropagate', 'items.unlockAndPropagate', 'items.reload.hidden'],
            object: ['items.add', 'items.addFolder', 'items.importCsv', 'items.cut', 'items.copy', 'items.delete', 'items.rename', 'items.reload', 'items.searchAndMove', 'items.lock', 'items.unlock', 'items.lockAndPropagate', 'items.unlockAndPropagate', 'items.changeChildrenSortBy']
        };

        var config = data.config;
        if(!config.treeContextMenu){
            config.treeContextMenu = {};
        }
        PerspectiveViewHelper.checkAndCreateDataStructure(config.treeContextMenu, structure);

        this.documentTreeContextMenuGroup = new Ext.form.FieldSet({
            title: t('plugin_pimcore_perspectiveeditor_document') + ' - ' + t('plugin_pimcore_perspectiveeditor_contextmenu'),
            hidden: data.config.treetype !== 'document',
            margin: '30 0',
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

        this.assetTreeContextMenuGroup = new Ext.form.FieldSet({
            title: t('plugin_pimcore_perspectiveeditor_asset') + ' - ' + t('plugin_pimcore_perspectiveeditor_contextmenu'),
            hidden: data.config.treetype !== 'asset',
            margin: '30 0',
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
                PerspectiveViewHelper.generateCheckbox(t('hide reload'), config.treeContextMenu.asset.items.reload, 'hidden', true, this.setDirty.bind(this, true))
            ]
        });

        this.objectTreeContextMenuGroup = new Ext.form.FieldSet({
            title: t('plugin_pimcore_perspectiveeditor_object') + ' - ' + t('plugin_pimcore_perspectiveeditor_contextmenu'),
            hidden: data.config.treetype !== 'object',
            margin: '30 0',
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
                PerspectiveViewHelper.generateCheckbox(t('lock and propagate'), config.treeContextMenu.object.items, 'lockAndPropagate', false, this.setDirty.bind(this, true)),
                PerspectiveViewHelper.generateCheckbox(t('lockAndPropagate'), config.treeContextMenu.object.items, 'unlockAndPropagate', false, this.setDirty.bind(this, true)),
                PerspectiveViewHelper.generateCheckbox(t('sorting'), config.treeContextMenu.object.items, 'changeChildrenSortBy', false, this.setDirty.bind(this, true))
            ]
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
