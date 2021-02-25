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

    static generateCheckbox (label, config, key, inverted = false, changeCallback){
        return new Ext.form.Checkbox({
            boxLabel: label,
            checked: inverted ? !config[key] : config[key],
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
                        c[keyPath[j]] = j*1 + 1 === keyPath.length ? 1 : {};
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

    static createIconFormPanel (record, id, applyToRecord, changeCallback){
        var iconField = new Ext.form.field.Text({
            id: "iconfield-" + id,
            name: "icon",
            width: 500,
            value: record.data.config.icon,
            margin: '10 0 0 10',
            listeners: {
                "afterrender": function (el) {
                    el.inputEl.applyStyles("background:url(" + el.getValue() + ") right center no-repeat;");
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
