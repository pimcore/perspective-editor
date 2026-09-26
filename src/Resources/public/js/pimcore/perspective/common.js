/**
* This source file is available under the terms of the
* Pimcore Open Core License (POCL)
* Full copyright and license information is available in
* LICENSE.md which is distributed with this source code.
*
*  @copyright  Copyright (c) Pimcore GmbH (http://www.pimcore.com)
*  @license    Pimcore Open Core License (POCL)
*/


pimcore.registerNS('pimcore.bundle.perspectiveeditor.PerspectiveViewHelper');

pimcore.bundle.perspectiveeditor.PerspectiveViewHelper = class {

    static routePrefix = '/admin/perspectives-views';

    static generateUuid (){
        return 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'.replace(/x/g, function(c) {
            const r = Math.random() * 16 | 0;
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
    }

    static reloadTreeNode (record){
        record.parentNode.collapse();
        record.parentNode.expand();
    }

    /**
     * Serializes the given tree store and triggers a download of the result as a JSON file.
     * The exported format matches the data that is sent to the server on save, so it can be
     * re-imported on another server to migrate perspectives or views.
     */
    static exportTreeStore (treeStore, filename){
        const data = treeStore.getRoot().serialize();
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], {type: 'application/json'});
        const url = window.URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        window.URL.revokeObjectURL(url);
    }

    /**
     * Opens a file picker and reads the selected file as JSON. The parsed content is passed to the
     * given callback. Invalid JSON triggers an error notification.
     */
    static importFromFile (callback){
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json,.json';
        input.style.display = 'none';

        input.addEventListener('change', function(){
            const file = input.files && input.files[0];
            if (!file) {
                return;
            }

            const reader = new FileReader();
            reader.onload = function(){
                let data;
                try {
                    data = JSON.parse(reader.result);
                } catch (e) {
                    Ext.MessageBox.alert(t('error'), t('plugin_pimcore_perspectiveeditor_import_invalid_file'));
                    return;
                }
                callback(data);
            };
            reader.onerror = function(){
                Ext.MessageBox.alert(t('error'), t('plugin_pimcore_perspectiveeditor_import_invalid_file'));
            };
            reader.readAsText(file);
        });

        document.body.appendChild(input);
        input.click();
        document.body.removeChild(input);
    }

    /**
     * Normalizes a node coming from an import file so it can be safely appended to a tree store on
     * another server: new ids are generated to avoid collisions, the node is marked writeable and
     * the "disabled" styling is removed. Runs recursively on all children.
     */
    static prepareImportedNode (node){
        node.id = this.generateUuid();
        node.writeable = true;

        if (typeof node.cls === 'string') {
            node.cls = node.cls.replace('pimcore_tree_node_disabled', '').trim();
        }

        if (Array.isArray(node.children)) {
            node.children.forEach(function(child){
                this.prepareImportedNode(child);
            }.bind(this));
        }

        return node;
    }

    /**
     * Extracts the list of child nodes from an imported payload. Accepts either a serialized tree
     * store ({children: [...]}) or a plain array of nodes.
     */
    static getImportedChildren (data){
        if (Array.isArray(data)) {
            return data;
        }
        if (data && Array.isArray(data.children)) {
            return data.children;
        }
        return [];
    }

    static generateCheckbox (label, config, key, inverted = false, changeCallback = null, readOnly = false){
        return new Ext.form.Checkbox({
            boxLabel: label,
            checked: inverted ? !config[key] : config[key],
            readOnly: readOnly,
            listeners: {
                change: function(elem, newValue, oldValue){
                    config[key] = newValue;
                    if(changeCallback) {
                        changeCallback();
                    }
                }.bind(this)
            },
        });
    }

    static checkAndCreateDataStructure (config, structure){
        for(let key in structure){
            if(!(key in config)){
                config[key] = {};
            }

            //support shortcut definitions
            if(Number.isInteger(config[key]) || typeof config[key] === "boolean") {
                config[key] = {
                    hidden: !config[key]
                };
            }

            for(let i in structure[key]){
                var keyPath = structure[key][i].split('.');
                var c = config[key];
                for(let j in keyPath){
                    if(!(keyPath[j] in c)){
                        let defaultValue = true;
                        if(keyPath[j] == 'hidden') {
                            defaultValue = false;
                        }

                        c[keyPath[j]] = j*1 + 1 === keyPath.length ? defaultValue : {};
                    }

                    //support inline shortcut definitions
                    if((Number.isInteger(c[keyPath[j]]) || typeof c[keyPath[j]] === "boolean") && j*1 + 1 < keyPath.length) {
                        c[keyPath[j]] = {
                            hidden: !c[keyPath[j]]
                        };
                    }

                    c = c[keyPath[j]];
                }
            }
        }
    }

    static generateCheckboxesForStructure (configStructure, checkboxItems, callback, labelPrefix, readOnly) {
        const keys = Object.keys(configStructure);
        keys.sort();

        for(let i = 0; i<keys.length; ++i){
            let key = keys[i];
            if(configStructure.hasOwnProperty(key)) {

                let label = labelPrefix + '_' + key;

                //check if key is permission or has sub-items
                if(Number.isInteger(configStructure[key]) || typeof configStructure[key] === "boolean") {

                    //create checkbox for permission
                    checkboxItems.push(this.generateCheckbox(t(label), configStructure, key, false, callback, readOnly));

                } else {

                    //create checkboxes for sub-items
                    this.generateCheckboxesForStructure(configStructure[key], checkboxItems, callback, label, readOnly);

                }
            }
        }

    }

    static createIconFormPanel (record, id, applyToRecord, changeCallback){
        var iconField = new Ext.form.field.Text({
            id: "iconfield-" + id,
            name: "icon",
            width: 500,
            value: record.data.config.icon,
            margin: '10 0 0 10',
            listeners: {
                "afterrender": function (el) {
                    el.inputEl.applyStyles("background:url(" + el.getValue() + ") right center no-repeat; background-size:contain;");
                },
                change: function(field, newValue) {

                    record.data.config.icon = newValue;
                    if(applyToRecord){
                        record.data.icon = newValue;
                        pimcore.bundle.perspectiveeditor.PerspectiveViewHelper.reloadTreeNode(record);
                    }

                    if(changeCallback) {
                        changeCallback();
                    }
                }
            },
        });

        var iconStore = new Ext.data.ArrayStore({
            proxy: {
                url: Routing.generate('pimcore_admin_dataobject_class_geticons'),
                type: 'ajax',
                reader: {
                    type: 'json'
                },
                extraParams: {
                    classId: id,
                }
            },
            fields: ["text", "value"],
        });

        return new Ext.form.Panel({
            disabled: !record.data["writeable"],
            title: t('plugin_pimcore_perspectiveeditor_icon_selection'),
            iconCls: 'pimcore_icon_asset',
            layout: "hbox",
            items: [
                iconField,
                new Ext.form.ComboBox({
                    store: iconStore,
                    width: 50,
                    valueField: 'value',
                    displayField: 'text',
                    margin: '10 0 0',
                    listeners: {
                        select: function(el, rec, idx){
                            var icon = el.container.down("#iconfield-" + id);
                            var newValue = rec.data.value;
                            icon.component.setValue(newValue);
                            icon.component.inputEl.applyStyles("background:url(" + newValue + ") right center no-repeat;");
                            record.data.config.icon = newValue;
                            if(applyToRecord){
                                record.data.icon = newValue;
                                pimcore.bundle.perspectiveeditor.PerspectiveViewHelper.reloadTreeNode(record);
                            }

                            if(changeCallback) {
                                changeCallback();
                            }
                            return newValue;
                        }.bind(this),
                    },
                }),
                new Ext.Button({
                    iconCls: 'pimcore_icon_refresh',
                    tooltip: t('refresh'),
                    margin: '10 0 0',
                    handler: function(iconField) {
                        iconField.inputEl.applyStyles("background:url(" + iconField.getValue() + ") right center no-repeat;");
                    }.bind(this, iconField),
                }),
                new Ext.Button({
                    iconCls: "pimcore_icon_icons",
                    text: t('icon_library'),
                    margin: '10 0 0',
                    handler: function () {
                        pimcore.helpers.openGenericIframeWindow("icon-library", Routing.generate('pimcore_admin_misc_iconlist'), "pimcore_icon_icons", t("icon_library"));
                    },
                }),
            ],
        });
    }
}
