'use strict';

const
    abFields = require('ab-fields'),
    abLayouts = require('ab-layouts'),
    abNodes = require('ab-nodes'),
    js0 = require('js0'),

    spocky = require('.'),
    Holder = require('./Holder'),

    Elems = require('./LayoutParser.Elems'),
    FieldInfo = require('./LayoutParser.FieldInfo'),
    FieldsHelper =  require('./LayoutParser.FieldsHelper'),
    Holders = require('./LayoutParser.Holders'),
    RepeatInfo = require('./LayoutParser.RepeatInfo')
;

export default class LayoutParser extends abLayouts.Parser
{

    get data() {
        return this._data;
    }

    get elems() {
        return this._elems;
    }

    get fields() {
        return this._fields;
    }

    get holders() {
        return this._holders;
    }


    constructor()
    {
        super();

        this._fieldsHelper = new FieldsHelper();

        this._fields = null;        
        this._elems = new Elems();
        this._holders = new Holders();
        this._data = {};
    }


    _createContentElement(nodeInfo, elementsStack)
    {
        let node = this._createTextNode(nodeInfo.content, elementsStack);

        return new abLayouts.Parser.Element(node, node, null);
    }

    _createElement(nodeInfo, elementsStack)
    {
        let element = new abLayouts.Parser.Element(null, null, {});

        this._createElement_AddRepeat(nodeInfo, elementsStack, element);
        let tElementsStack = elementsStack.concat([ element ]);
        this._createElement_AddHide(nodeInfo, tElementsStack, element);
        this._createElement_AddShow(nodeInfo, tElementsStack, element);
        this._createElement_AddSingle(nodeInfo, tElementsStack, element);
        this._createElement_AddField(nodeInfo, tElementsStack, element);
        this._createElement_AddHolder(nodeInfo, tElementsStack, element);
        this._createElement_ParseElem(nodeInfo, tElementsStack, element);
        this._createElement_ParseData(nodeInfo, tElementsStack, element);

        return element;
    }

    _createElement_AddField(nodeInfo, elementsStack, element)
    {
        if (!('_field' in nodeInfo.attribs))
            return;
        if (nodeInfo.type === '$')
            throw new Error(`'_field' cannot be in virtual node.`);
        this._fieldsHelper.validateFieldName(nodeInfo.attribs._field[0], false);

        let node = element.bottomNode;

        let repeatInfo = new RepeatInfo(elementsStack);
        let fieldInfo = this._fieldsHelper.def(repeatInfo, nodeInfo.attribs._field[0],
                false, abFields.VarDefinition);

        /* Default */
        node.innerHTML = fieldInfo.getValue(this._fields, []);

        /* Field Listeners */
        for (let fd of fieldInfo.fieldDefinitions) {
            fd.addListener({
                change: (value, keys) => {
                    let nodeInstances = this._getNodeInstances(repeatInfo, fieldInfo, 
                        node, keys);
                    for (let nodeInstance of nodeInstances) {
                        nodeInstance.htmlElement.innerHTML = fieldInfo.getValue(
                                this._fields, keys);
                    }
                },
            });
        }

        /* Virtual */
        if (repeatInfo.virtual) {
            node.pCopyable.onCreate((nodeInstance, instanceKeys) => {  
                /* Virtual Node */
                if (instanceKeys.length < repeatInfo.repeats.length)
                    return;

                let value = fieldInfo.getValue(this._fields, instanceKeys);

                let nodeInstances = node.pCopyable.getNodeCopies(instanceKeys);
                for (let nodeInstance of nodeInstances)
                    nodeInstance.htmlElement.innerHTML = value;
            });
        }
    }

    _createElement_AddHide(nodeInfo, elementsStack, element)
    {
        if (!('_hide' in nodeInfo.attribs))
            return;
        this._fieldsHelper.validateFieldName(nodeInfo.attribs._hide[0], false);

        let node = new abNodes.HideNode();
        this._createElement_UpdateElement(element, node);

        let repeatInfo = new RepeatInfo(elementsStack);
        let fieldInfo = this._fieldsHelper.def(repeatInfo, nodeInfo.attribs._hide[0],
                false, abFields.VarDefinition);
    
        /* Default */
        node.hide = fieldInfo.getValue(this._fields, []) ? true : false;

        /* Field Listeners */
        for (let fd of fieldInfo.fieldDefinitions) {
            fd.addListener({
                change: (value, keys) => {
                    let nodeInstances = this._getNodeInstances(repeatInfo, fieldInfo, 
                            node, keys);
                    for (let nodeInstance of nodeInstances) {
                        nodeInstance.hide = fieldInfo.getValue(
                                this._fields, keys) ? true : false;
                    }
                },
            });
        }

        /* Virtual */
        if (repeatInfo.virtual) {
            node.pCopyable.onCreate((nodeInstance, instanceKeys) => {
                /* Virtual Node */
                if (instanceKeys.length < repeatInfo.repeats.length)
                    return;

                let value = fieldInfo.getValue(this._fields, instanceKeys);

                let nodeInstances = node.pCopyable.getNodeCopies(instanceKeys);
                for (let nodeInstance of nodeInstances)
                    nodeInstance.hide = value ? true : false;
            });
        }
    }

    _createElement_AddHolder(nodeInfo, elementsStack, element)
    {
        if (!('_holder' in nodeInfo.attribs))
            return;

        let node = new abLayouts.LayoutNode();
        this._createElement_UpdateElement(element, node);

        let repeatInfo = new RepeatInfo(elementsStack);

        if (repeatInfo.virtual) {
            element.info.holders_OnCreateFn = null;
            element.info.holders_OnDestroyFn = null;

            // this._elems._declare(elemName);
            node.pCopyable.onCreate((node) => {
                let keys = node.pCopyable.getInstanceKeys();
                
                /* Virtual Node */
                if (keys.length < repeatInfo.repeats.length)
                    return;

                // this._elems._add(elemName, keys, node.htmlElement);

                if (element.info.holders_OnCreateFn !== null) {
                    element.info.holders_OnCreateFn(new Holder(node), keys);
                }
            });
            node.pCopyable.onDestroy((node) => {
                let keys = node.pCopyable.getInstanceKeys();

                // this._elems._remove(elemName, keys);

                if (element.info.holders_OnDestroyFn !== null) {
                    element.info.holders_OnDestroyFn(new Holder(node), keys);
                }
            });

            Object.defineProperty(this._holders, nodeInfo.attribs._holder, {
                get: () => {
                    return (onCreateFn) => {
                        element.info.holders_OnCreateFn = onCreateFn;

                        let nodeInstances = node.pCopyable.getNodeCopies();
                        for (let nodeInstance of nodeInstances) {
                            let instanceKeys = nodeInstance.pCopyable.getInstanceKeys();
                            onCreateFn(new Holder(nodeInstance), instanceKeys);
                        }
                    };
                }
            });
        } else {
            Object.defineProperty(this._holders, nodeInfo.attribs._holder, {
                value: new Holder(node), 
                enumerable: true,
            });
        }
    }

    _createElement_AddRepeat(nodeInfo, elementsStack, element)
    {
        if (!('_repeat' in nodeInfo.attribs))
            return;

        let repeatNameArr = nodeInfo.attribs._repeat[0].split(':');
        if (repeatNameArr.length !== 2)
            throw new Error('Repeat format must be `[fieldName]:[itemFieldName].');

        let fieldName = repeatNameArr[0];
        let itemName = repeatNameArr[1];

        this._fieldsHelper.validateFieldName(fieldName, false);
        this._fieldsHelper.validateFieldName(itemName, false);

        let node = new abNodes.RepeatNode();
        this._createElement_UpdateElement(element, node);

        let repeatInfo = new RepeatInfo(elementsStack);
        let fieldInfo = this._fieldsHelper.def(repeatInfo, fieldName,
                false, abFields.ListDefinition);

        let fd = fieldInfo.fieldDefinitions[0];

        element.info.repeat = {
            node: node,
            fieldInfo: fieldInfo,
            itemName: itemName,
            fieldDefinition: fd,
        };
        
        fd.addListener({
            add: (index, key, keys) => {
                let nodeInstances = this._getNodeInstances(repeatInfo, fieldInfo, 
                        node, keys);
                for (let nodeInstance of nodeInstances)
                    nodeInstance.addAt(index, key);
            },
            delete: (key, keys) => {
                let nodeInstances = this._getNodeInstances(repeatInfo, fieldInfo, 
                        node, keys);
                for (let nodeInstance of nodeInstances)
                    nodeInstance.delete(key);
            },
        });

        if (repeatInfo.virtual) {
            node.pCopyable.onCreate((nodeInstance, instanceKeys) => {
                /* Virtual Node */
                if (instanceKeys.length < repeatInfo.repeats.length)
                    return;

                let field = fieldInfo.getField(this._fields, instanceKeys);

                let nodeInstances = node.pCopyable.getNodeCopies(instanceKeys);
                for (let nodeInstance of nodeInstances) {
                    for (let [ key, value ] of field)
                        nodeInstance.add(key);
                }
            });
        }

        // if ('_id' in nodeInfo.attribs)
        //     this._nodes.set(`${nodeInfo.attribs._id}.single`, node);
    }

    _createElement_AddShow(nodeInfo, elementsStack, element)
    {
        if (!('_show' in nodeInfo.attribs))
            return;
        this._fieldsHelper.validateProperty(nodeInfo.attribs._show[0], false);

        let node = new abNodes.ShowNode();
        this._createElement_UpdateElement(element, node);

        let repeatInfo = new RepeatInfo(elementsStack);
        let fieldInfo = this._fieldsHelper.def(repeatInfo, nodeInfo.attribs._show[0],
                false, abFields.VarDefinition);
    
        /* Default */
        node.show = fieldInfo.getValue(this._fields, []) ? true : false;

        /* Field Listeners */
        for (let fd of fieldInfo.fieldDefinitions) {
            fd.addListener({
                change: (value, keys) => {
                    let nodeInstances = this._getNodeInstances(repeatInfo, fieldInfo, 
                            node, keys);
                    for (let nodeInstance of nodeInstances) {
                        nodeInstance.show = fieldInfo.getValue(
                                this._fields, keys) ? true : false;
                    }
                },
            });
        }

        /* Virtual */
        if (repeatInfo.virtual) {
            node.pCopyable.onCreate((nodeInstance, instanceKeys) => {
                /* Virtual Node */
                if (instanceKeys.length < repeatInfo.repeats.length)
                    return;

                let value = fieldInfo.getValue(this._fields, instanceKeys);

                let nodeInstances = node.pCopyable.getNodeCopies(instanceKeys);
                for (let nodeInstance of nodeInstances)
                    nodeInstance.show = value ? true : false;
            });
        }
    }

    _createElement_AddSingle(nodeInfo, elementsStack, element)
    {
        if (nodeInfo.type === '$')
            return;

        let repeatInfo = new RepeatInfo(elementsStack);

        let node = new abNodes.SingleNode(nodeInfo.type);
        this._createElement_UpdateElement(element, node);

        this._createElement_AddSingle_ParseAttribs(repeatInfo, node, nodeInfo.attribs);
    }

    _createElement_AddSingle_ParseAttribs(repeatInfo, node, attribs)
    {
        for (let attribName in attribs) {
            // if (attribName[0] === '$')
            //     continue;

            let attribArr = attribs[attribName];
            let attribArr_FieldInfos = [];
            for (let attribPart of attribArr) {
                if (!this._fieldsHelper.isValidString(attribPart, true)) {
                    attribArr_FieldInfos.push(null);
                    continue;
                }

                let fieldInfo = this._fieldsHelper.def(repeatInfo, attribPart,
                        true, abFields.VarDefinition);
                attribArr_FieldInfos.push(fieldInfo);

                for (let fd of fieldInfo.fieldDefinitions) {
                    fd.addListener({
                        change: (value, keys) => {
                            let nodeInstances = this._getNodeInstances(repeatInfo, 
                                    fieldInfo, node, keys);
                            for (let nodeInstance of nodeInstances) {
                                let instanceKeys = nodeInstance.pCopyable.getInstanceKeys();
                                let attrib = this._createElement_AddSingle_GetAttrib(
                                        attribArr, attribArr_FieldInfos, instanceKeys);

                                if (attribName in nodeInstance.htmlElement)
                                    nodeInstance.htmlElement[attribName] = attrib;
                                else
                                    nodeInstance.htmlElement.setAttribute(attribName, attrib);
                            }
                        },
                    });
                }
            }

            /* Default */
            let attrib = this._createElement_AddSingle_GetAttrib(
                    attribArr, attribArr_FieldInfos, []);
            if (attribName in node.htmlElement)
                node.htmlElement[attribName] = attrib;
            else
                node.htmlElement.setAttribute(attribName, attrib);

            /* Virtual */
            if (repeatInfo.virtual) {
                node.pCopyable.onCreate((nodeInstance, instanceKeys) => {
                    /* Virtual Node */
                    if (instanceKeys.length < repeatInfo.repeats.length)
                        return;

                    let attrib = this._createElement_AddSingle_GetAttrib(
                            attribArr, attribArr_FieldInfos, instanceKeys);
                    if (attribName in nodeInstance.htmlElement)
                        nodeInstance.htmlElement[attribName] = attrib;
                    else
                        nodeInstance.htmlElement.setAttribute(attribName, attrib);
                });
            }
        }
    }

    _createElement_AddSingle_GetAttrib(attribArr, attribArr_FieldInfos, instanceKeys)
    {
        let attrib = '';
        for (let i = 0; i < attribArr.length; i++) {
            if (attribArr_FieldInfos[i] !== null) 
                attrib += attribArr_FieldInfos[i].getValue(this._fields, instanceKeys);
            else
                attrib += attribArr[i];
        }

        return attrib;
    }

    _createElement_ParseData(nodeInfo, elementsStack, element)
    {
        for (let attribName in nodeInfo.attribs) {
            if (attribName.indexOf('_data-') !== 0)
                continue;

            let attribArr = nodeInfo.attribs[attribName];

            let dataName = attribName.substring(`_data-`.length);
            let data = attribArr[0].replace(/\\"/g, '"');
    
            if (!(dataName in this._data))
                this._data[dataName] = [];
    
            this._data[dataName].push(data);
        }
    }

    _createElement_ParseElem(nodeInfo, elementsStack, element)
    {
        if (!('_elem' in nodeInfo.attribs))
            return;

        let elemName = nodeInfo.attribs._elem[0];
        if (this._elems.$exists(elemName)) {
            if (spocky.Debug) {
                console.warn(`Element '${elemName}' already exist. Skipping in:`, 
                        nodeInfo, new Error());
            }

            return;
        }

        let node = element.bottomNode;

        let repeatInfo = new RepeatInfo(elementsStack);

        if (repeatInfo.virtual) {
            element.info.elems_OnCreateFn = null;
            element.info.elems_OnDestroyFn = null;

            this._elems._declare(elemName);
            node.pCopyable.onCreate((node) => {
                let keys = node.pCopyable.getInstanceKeys();
                
                /* Virtual Node */
                if (keys.length < repeatInfo.repeats.length)
                    return;

                this._elems._add(elemName, keys, node.htmlElement);

                if (element.info.elems_OnCreateFn !== null) {
                    element.info.elems_OnCreateFn(node.htmlElement, keys);
                }
            });
            node.pCopyable.onDestroy((node) => {
                let keys = node.pCopyable.getInstanceKeys();

                this._elems._remove(elemName, keys);

                if (element.info.elems_OnDestroyFn !== null) {
                    element.info.elems_OnDestroyFn(node.htmlElement, keys);
                }
            });

            Object.defineProperty(this._elems, nodeInfo.attribs._elem, {
                get: () => {
                    return (onCreateFn) => {
                        element.info.elems_OnCreateFn = onCreateFn;
                        
                        let nodeInstances = node.pCopyable.getNodeCopies();
                        for (let nodeInstance of nodeInstances) {
                            let instanceKeys = nodeInstance.pCopyable.getInstanceKeys();
                            onCreateFn(nodeInstance.htmlElement, instanceKeys);
                        }
                    };
                }
            });
        } else {
            this._elems._declare(elemName);
            this._elems._add(elemName, [], node.htmlElement);

            Object.defineProperty(this._elems, nodeInfo.attribs._elem, {
                get: () => {
                    return node.htmlElement;
                }
            });
        }
    }

    _createElement_UpdateElement(element, new_bottom_node)
    {
        if (element.topNode === null)
            element.topNode = new_bottom_node;
        if (element.bottomNode !== null)
            element.bottomNode.pChildren.add(new_bottom_node);
        element.bottomNode = new_bottom_node;
    }

    _createTextNode(nodeContent, elementsStack)
    {
        let node = null;

        if (this._fieldsHelper.isValidString(nodeContent, true)) {
            let repeatInfo = new RepeatInfo(elementsStack);
            let fieldInfo = this._fieldsHelper.def(repeatInfo, nodeContent,
                    true, abFields.VarDefinition);
            
            node = new abNodes.TextNode(fieldInfo.getValue(this._fields, []));

            for (let fd of fieldInfo.fieldDefinitions) {
                fd.addListener({
                    change: (value, keys) => {
                        let nodeInstances = this._getNodeInstances(repeatInfo, fieldInfo, 
                                node, keys);

                        for (let nodeInstance of nodeInstances)
                            nodeInstance.text = fieldInfo.getValue(this._fields, keys);
                    },
                });
            }

            if (repeatInfo.virtual) {
                node.pCopyable.onCreate((nodeInstance, instanceKeys) => {
                    /* Virtual Node */
                    if (instanceKeys.length < repeatInfo.repeats.length)
                        return;

                    let value = fieldInfo.getValue(this._fields, instanceKeys);
                    let nodeInstances = node.pCopyable.getNodeCopies(instanceKeys);

                    for (let nodeInstance of nodeInstances)
                        nodeInstance.text = value;
                });
            }
        } else
            node = new abNodes.TextNode(nodeContent);

        return node;
    }

    _getNodeInstances(repeatInfo, fieldInfo, node, keys)
    {
        if (repeatInfo.repeats.length === 0)
            return [ node ];

        let fieldInfos_Requested = [];
        let nodeCopies = [];

        /* Main Field */
        if (fieldInfo.type === FieldInfo.Types.Field || 
                fieldInfo.type === FieldInfo.Types.Function)
            fieldInfos_Requested.push(fieldInfo);
        
        /* Arg Fields */
        if (fieldInfo.type === FieldInfo.Types.Function) {
            for (let argField of fieldInfo.fieldFn_ArgFields)
                fieldInfos_Requested.push(argField.fieldInfo);
        }

        if (fieldInfo.type === FieldInfo.Types.Expression) {
            for (let argField of fieldInfo.expr_ArgFields)
                fieldInfos_Requested.push(argField.fieldInfo);
        }

        /* Node Copies */
        for (let fieldInfo_Requested of fieldInfos_Requested) {
            let repeatKeys = repeatInfo.getKeys(fieldInfo_Requested, keys);
            let nodeCopies_T = node.pCopyable.getNodeCopies(repeatKeys);
            for (let nodeCopy_T of nodeCopies_T) {
                if (!nodeCopies.includes(nodeCopy_T))
                    nodeCopies.push(nodeCopy_T);
            }
        }

        return nodeCopies;
    }

    _isVirtual(elementsStack)
    {
        for (let i = 0; i < elementsStack.length; i++) {
            if ('repeat' in elementsStack[i].info)
                return true;
        }

        return false;
    }


    /* abLayouts.Parser Overrides */
    __afterParse()
    {
        this._fields = this._fieldsHelper._fieldDefinitions.create();
    }
    
    __createElement(nodeInfo, elementsStack)
    {
        if (nodeInfo.type === '_content')
            return this._createContentElement(nodeInfo, elementsStack);
        else
            return this._createElement(nodeInfo, elementsStack);
    }
    /* abLayouts.Parser Overrides */

}