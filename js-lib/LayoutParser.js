'use strict';

const
    abFields = require('ab-fields'),
    abLayouts = require('ab-layouts'),
    abNodes = require('ab-nodes'),
    js0 = require('js0'),

    spocky = require('.'),
    Holder = require('./Holder')
;

class LayoutParser extends abLayouts.Parser
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

        this._fieldNameRegexp = new RegExp('^' + this.getFieldNameRegexp() + '$');

        this._fieldDefinitions = abFields.define();

        this._fields = null;        
        this._elems = new LayoutParser.Elems();
        this._holders = {};
        this._data = {};
    }

    getFieldNameRegexp()
    {
        return '([a-zA-Z][a-zA-Z0-9._]*)(\((.*)\))?';
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
        this._validateFieldName(nodeInfo.attribs._field[0], false);

        let singleNode = element.bottomNode;

        let repeatInfo = new LayoutParser.RepeatInfo(elementsStack);
        let fieldInfo = new LayoutParser.FieldInfo(nodeInfo.attribs._field[0]);

        let fdVar = this._defineField(repeatInfo, fieldInfo, abFields.VarDefinition);

        fdVar.addListener({
            set: (value, keys) => {
                let nodeInstances = this._getNodeInstances(repeatInfo, fieldInfo, 
                        singleNode, keys);
                for (let nodeInstance of nodeInstances) {
                    value = typeof value === 'function' ? eval(`value(${fieldInfo.args})`) : value;
                    if (value === null)
                        value = '';
                    else if (typeof value === 'undefined')
                        value = '';

                    nodeInstance.htmlElement.innerHTML = value;
                }
            },
        });

        if (repeatInfo.virtual) {
            singleNode.pCopyable.onCreate((nodeInstance, instanceKeys) => {  
                /* Virtual Node */
                if (instanceKeys.length < repeatInfo.repeats.length)
                    return;

                let field = fieldInfo.getField(this._fields, repeatInfo, instanceKeys);

                let value = typeof field.$value === 'function' ?
                        eval(`field.$value(${fieldInfo.args})`) : field.$value;
                if (value === null)
                    value = '';
                else if (typeof value === 'undefined')
                    value = '';

                nodeInstance.htmlElement.innerHTML = value;

            });
        }
    }

    _createElement_AddHide(nodeInfo, elementsStack, element)
    {
        if (!('_hide' in nodeInfo.attribs))
            return;
        this._validateFieldName(nodeInfo.attribs._hide[0], false);

        let node = new abNodes.HideNode();
        this._createElement_UpdateElement(element, node);

        let repeatInfo = new LayoutParser.RepeatInfo(elementsStack);
        let fieldInfo = new LayoutParser.FieldInfo(nodeInfo.attribs._hide[0]);

        let fd = this._defineField(repeatInfo, fieldInfo, abFields.VarDefinition);
    
        fd.addListener({
            set: (value, keys) => {
                let nodeInstances = this._getNodeInstances(repeatInfo, fieldInfo, node, keys);
                for (let nodeInstance of nodeInstances)
                    nodeInstance.hide = value ? true : false;
            },
        });

        if (repeatInfo.virtual) {
            node.pCopyable.onCreate((nodeInstance, instanceKeys) => {
                /* Virtual Node */
                if (instanceKeys.length < repeatInfo.repeats.length)
                    return;

                let field = fieldInfo.getField(this._fields, repeatInfo, instanceKeys);
                nodeInstance.hide = field.$value ? true : false;
            });
        }
    }

    _createElement_AddHolder(nodeInfo, elementsStack, element)
    {
        if (!('_holder' in nodeInfo.attribs))
            return;

        let node = new abLayouts.LayoutNode();
        this._createElement_UpdateElement(element, node);

        let repeatInfo = new LayoutParser.RepeatInfo(elementsStack);

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

        let node = new abNodes.RepeatNode();
        this._createElement_UpdateElement(element, node);

        let repeatInfo = new LayoutParser.RepeatInfo(elementsStack);
        let fieldInfo = new LayoutParser.FieldInfo(fieldName);

        let fd = this._defineField(repeatInfo, fieldInfo, 
                abFields.ListDefinition);
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

                let field = fieldInfo.getField(this._fields, repeatInfo, instanceKeys);

                for (let [ key, value ] of field)
                    nodeInstance.add(key);
            });
        }

        // if ('_id' in nodeInfo.attribs)
        //     this._nodes.set(`${nodeInfo.attribs._id}.single`, node);
    }

    _createElement_AddShow(nodeInfo, elementsStack, element)
    {
        if (!('_show' in nodeInfo.attribs))
            return;
        this._validateFieldName(nodeInfo.attribs._show[0], false);

        let node = new abNodes.ShowNode();
        this._createElement_UpdateElement(element, node);

        let repeatInfo = new LayoutParser.RepeatInfo(elementsStack);
        let fieldInfo = new LayoutParser.FieldInfo(nodeInfo.attribs._show[0]);

        let fd = this._defineField(repeatInfo, fieldInfo, abFields.VarDefinition);
    
        fd.addListener({
            set: (value, keys) => {
                let nodeInstances = this._getNodeInstances(repeatInfo, fieldInfo, node, keys);
                for (let nodeInstance of nodeInstances)
                    nodeInstance.show = value ? true : false;
            },
        });

        if (repeatInfo.virtual) {
            node.pCopyable.onCreate((nodeInstance, instanceKeys) => {
                /* Virtual Node */
                if (instanceKeys.length < repeatInfo.repeats.length)
                    return;

                let field = fieldInfo.getField(this._fields, repeatInfo, instanceKeys);
                nodeInstance.show = field.$value ? true : false;
            });
        }
    }

    _createElement_AddSingle(nodeInfo, elementsStack, element)
    {
        if (nodeInfo.type === '$')
            return;

        let repeatInfo = new LayoutParser.RepeatInfo(elementsStack);

        let node = new abNodes.SingleNode(nodeInfo.type);
        this._createElement_UpdateElement(element, node);

        this._createElement_AddSingle_ParseAttribs(repeatInfo, node, nodeInfo.attribs);
    }

    _createElement_AddSingle_ParseAttribs(repeatInfo, node, attribs)
    {
        for (let attribName in attribs) {
            if (attribName[0] === '$')
                continue;

            let attribArr = attribs[attribName];
            for (let attribPart of attribArr) {
                if (!this._isFieldName(attribPart))
                    continue;

                let fieldInfo = new LayoutParser.FieldInfo(attribPart.substring(1));

                let fd = this._defineField(repeatInfo, fieldInfo, 
                        abFields.VarDefinition);

                fd.addListener({
                    set: (value, keys) => {
                        let nodeInstances = this._getNodeInstances(repeatInfo, 
                                fieldInfo, node, keys);
                        for (let nodeInstance of nodeInstances) {
                            let instanceKeys = nodeInstance.pCopyable.getInstanceKeys();
                            let attrib = this._createElement_AddSingle_GetAttrib(
                                    attribArr, repeatInfo, instanceKeys);

                            if (attribName in nodeInstance.htmlElement)
                                nodeInstance.htmlElement[attribName] = attrib;
                            else
                                nodeInstance.htmlElement.setAttribute(attribName, attrib);
                        }
                    },
                });
            }

            if (repeatInfo.virtual) {
                node.pCopyable.onCreate((nodeInstance, instanceKeys) => {
                    /* Virtual Node */
                    if (instanceKeys.length < repeatInfo.repeats.length)
                        return;

                    let attrib = this._createElement_AddSingle_GetAttrib(
                            attribArr, repeatInfo, instanceKeys);
                    nodeInstance.htmlElement.setAttribute(attribName, attrib);
                });
            } else {
                let attrib = '';
                for (let attribPart of attribArr)
                    attrib += this._isFieldName(attribPart) ? '' : attribPart;
                node.htmlElement.setAttribute(attribName, attrib);
            }
        }
    }

    _createElement_AddSingle_GetAttrib(attribArr, repeatInfo, instanceKeys)
    {
        let attrib = '';
        for (let attribPart of attribArr) {
            if (this._isFieldName(attribPart)) {
                let fieldInfo = new LayoutParser.FieldInfo(attribPart.substring(1));
                let fieldValue = fieldInfo.getField(this._fields, repeatInfo, 
                        instanceKeys).$value;
                attrib += typeof fieldValue === 'function' ?
                        eval(`fieldValue(${fieldInfo.args})`) : fieldValue;
            } else
                attrib += attribPart;
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

        let repeatInfo = new LayoutParser.RepeatInfo(elementsStack);

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

        if (this._isFieldName(nodeContent)) {
            node = new abNodes.TextNode('');

            let repeatInfo = new LayoutParser.RepeatInfo(elementsStack);
            let fieldInfo = new LayoutParser.FieldInfo(nodeContent.substring(1));

            let fdVar = this._defineField(repeatInfo, fieldInfo, abFields.VarDefinition);

            fdVar.addListener({
                set: (value, keys) => {
                    let nodeInstances = this._getNodeInstances(repeatInfo, fieldInfo, 
                            node, keys);
                    for (let nodeInstance of nodeInstances) {
                        nodeInstance.text = typeof value === 'function' ?
                                eval(`value(${fieldInfo.args})`) : value;
                    }
                },
            });

            if (repeatInfo.virtual) {
                node.pCopyable.onCreate((nodeInstance, instanceKeys) => {
                    /* Virtual Node */
                    if (instanceKeys.length < repeatInfo.repeats.length)
                        return;

                    let field = fieldInfo.getField(this._fields, repeatInfo, instanceKeys);
                    let nodeInstances = node.pCopyable.getNodeCopies(instanceKeys);

                    for (let nodeInstance of nodeInstances) {
                        nodeInstance.text = typeof field.$value === 'function' ?
                            eval(`field.$value(${fieldInfo.args})`) : field.$value;
                    }

                    // if (field === null)
                    //     nodeInstance.text = "";
                    // else {
                    //     nodeInstance.text = typeof field.$value === 'function' ?
                    //             eval(`field.$value(${fieldInfo.args})`) : field.$value;
                    // }
                    

                });
            }
        } else
            node = new abNodes.TextNode(nodeContent);

        return node;
    }

    _defineField(repeatInfo, fieldInfo, newFieldDefinitionClass)
    {
        let fd = this._fieldDefinitions;
        let repeatOffset = 0;

        /* Check if is list. */
        let firstPart = fieldInfo.parts[0];
        let repeatFound = false;
        for (let i = repeatInfo.repeats.length - 1; i >= repeatOffset; i--) {
            if (firstPart !== repeatInfo.repeats[i].itemName)
                continue;
            repeatFound = true;

            fd = repeatInfo.repeats[i].fieldDefinition;
            if (fieldInfo.parts.length === 1)
                return fd.item(newFieldDefinitionClass);
            
            fd = fd.item(abFields.ObjectDefinition);
        }

        for (let i = repeatFound ? 1 : 0; i < fieldInfo.parts.length - 1; i++) {
            let part = fieldInfo.parts[i];
            fd = fd.object(part);
        }

        let lastPart = fieldInfo.parts[fieldInfo.parts.length - 1];

        if (newFieldDefinitionClass === abFields.ObjectDefinition)
            return fd.object(lastPart);
        else if (newFieldDefinitionClass === abFields.ListDefinition)
            return fd.list(lastPart);
        else if (newFieldDefinitionClass === abFields.VarDefinition)
            return fd.var(lastPart);
        else
           throw new Error(`Unknown 'newFieldDefinitionClass'.`);
    }

    // _getFieldDefs(repeatInfo, fieldInfo)
    // {
    //     let fd = this._fieldDefinitions;
    //     let repeatOffset = 0;
    //     for (let i = 0; i < fieldInfo.parts.length - 1; i++) {
    //         let part = fieldInfo.parts[i];

    //         let repeatFound = false;
    //         for (let j = repeatInfo.repeats.length - 1; j >= repeatOffset; j--) {
    //             if (part === repeatInfo.repeats[j].itemName) {
    //                 part = repeatInfo.repeats[j].fieldName;
    //                 if (fd instanceof abFields.ObjectDefinition)
    //                     fd = fd.list(part);
    //                 else if (fd instanceof abFields.ListDefinition)
    //                     fd = fd.item(abFields.ListDefinition);
    //                 else
    //                     js0.assert('Unknown definition type.');
                    
    //                 repeatOffset = j;
    //                 repeatFound = true;
                    
    //                 break;
    //             }
    //         }
    //         if (repeatFound)
    //             continue;
              
    //         if (fd instanceof abFields.ObjectDefinition)
    //             fd = fd.object(part);
    //         else if (fd instanceof abFields.ListDefinition)
    //             fd = fd.item(abFields.ObjectDefinition);
    //         else
    //             js0.assert('Unknown definition type.');

    //         // let definition = fd.object(part);
    //         // if (i !== fieldInfo.parts.length - 1) {
    //         //     if (!(definition instanceof abFields.ObjectDefinition)) {
    //         //         throw new Error('Field `' + fieldInfo.parts.join('.') + 
    //         //                 '` type inconsistency.');
    //         //     }
    //         // }
    //     }

    //     return fd;
    // }

    _getNodeInstances(repeatInfo, fieldInfo, node, keys)
    {
        if (repeatInfo.repeats.length === 0)
            return [ node ];

        let repeatKeys = repeatInfo.getKeys(fieldInfo, keys);

        return node.pCopyable.getNodeCopies(repeatKeys);

        // let repeatNode = null;
        // let keysIndex = 0;
        // for (let i = 0; i < elementsStack.length; i++) {
        //     let element = elementsStack[i];
        //     if ('repeatNode' in element.info) {
        //         if (repeatNode === null)
        //             repeatNode = element.info.repeatNode;
        //         else {
        //             repeatNode = repeatNode.getInstanceNodeCopies(
        //                     element.info.repeatNode, keys[i])[0];
        //             keysIndex++;
        //         }

        //         if (keysIndex === keys.length - 1) {
        //             console.log('hm', repeatNode, node);
        //             console.log('jej', repeatNode.getInstanceNodeCopies(node, 
        //                     keys[keysIndex]).length);
        //             return repeatNode.getInstanceNodeCopies(node, keys[keysIndex])[0];
        //         }
        //     }
        // }

        // return null;
    }

    _isFieldName(fieldName, includesPrefix = true)
    {
        if (includesPrefix) {
            if (fieldName[0] !== '$')
                return false;

            return fieldName.substring(1).match(this._fieldNameRegexp) !== null;
        }

        return fieldName.match(this._fieldNameRegexp) !== null;
    }

    _isVirtual(elementsStack)
    {
        for (let i = 0; i < elementsStack.length; i++) {
            if ('repeat' in elementsStack[i].info)
                return true;
        }

        return false;
    }

    _validateFieldName(fieldName, includesPrefix = true)
    {
        if (!this._isFieldName(fieldName, includesPrefix))
            throw new Error(`'${fieldName}' is not a valid field name.`);
    }


    /* abLayouts.Parser Overrides */
    __afterParse()
    {
        this._fields = this._fieldDefinitions.create();
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
module.exports = LayoutParser;


Object.defineProperties(LayoutParser, {

    Elems: { value:
    class LayoutParser_Elems {

        constructor()
        {
            this._elemInfos = {};
        }
        
        $exists(elemName)
        {
            js0.args(arguments, 'string');

            return elemName in this._elemInfos; 
        }

        $get(elemName, keys)
        {
            js0.args(arguments, 'string', Array);

            if (!(elemName in this._elemInfos))
                throw new Error(`Elem '${elemName}' does not exist.`);

            return this._get(elemName, keys);
        }

        $keys(elemName)
        {
            js0.args(arguments, 'string');

            if (!this.$exists(elemName))
                throw new Error(`Elem '${elemName}' does not exist.`);

            let keys = [];
            for (let elemInfo of this._elemInfos[elemName]) {
                let keysArr = [];
                for (let key of elemInfo.keys)
                    keysArr.push(key);
                keys.push(keysArr);
            }

            return keys;
        }

        _add(elemName, keys, elem)
        {
            this._elemInfos[elemName].push({
                elem: elem,
                keys: keys,
            });
        }

        _declare(elemName)
        {
            this._elemInfos[elemName] = [];
        }

        _get(elemName, keys)
        {
            for (let elemInfo of this._elemInfos[elemName]) {
                if (this._keysMatch(elemInfo.keys, keys))
                    return elemInfo.elem;
            }

            throw new Error(`Elem '${elemName}' with keys '` + keys.join(', ') +
                    `' does not exist.`);
        }

        _keysMatch(keysA, keysB)
        {
            if (keysA.length !== keysB.length)
                return false;

            for (let i = 0; i < keysA.length; i++) {
                if (keysA[i] !== keysB[i])
                    return false;
            }

            return true;
        }

        _remove(elemName, keys)
        {
            if (!this.$exists(elemName))
                throw new Error(`Elem '${elemName}' does not exist.`);

            for (let i = 0; i < this._elemInfos[elemName].length; i++) {
                if (this._keysMatch(this._elemInfos[elemName][i].keys, keys)) {
                    this._elemInfos[elemName].splice(i, 1);
                    return;
                }
            }

            let keysStr = keys.join(', ');
            throw new Error(`Elem '${elemName}' with keys '${keysStr}' does not exist.`);
        }

    }},

    FieldInfo: { value:
    class LayoutParser_FieldInfo {

        constructor(fieldPath)
        {
            let regexp = /^([a-zA-Z][a-zA-Z0-9._]*)(\((.*)\))?$/;
            let match = regexp.exec(fieldPath);

            // console.log(fieldPath, match);
            this.fieldPath = match[1];
            this.args = typeof match[3] === 'undefined' ? null : match[3];
            this.parts = this.fieldPath.split('.');
            this.name = this.parts[this.parts.length - 1];
        }

        getField(fields, repeatInfo, keys)
        {
            let rawParts = this.getRawParts(repeatInfo);
            // keys = repeatInfo.getKeys(this, keys);

            let keysOffset = 0;
            let field = fields;
            let fieldPath = '';
            let repeatsOffset = 0;
            for (let part of rawParts) {
                if (field instanceof abFields.ObjectField) {
                    field = field.$get(part);
                    fieldPath += (fieldPath !== '' ? '.' : '') + part;
                }

                while (field instanceof abFields.ListField) {
                    let repeatFound = false;
                    for (let i = repeatsOffset; i < repeatInfo.repeats.length; i++) {
                        if (fieldPath === repeatInfo.repeats[i].fieldInfo.getFullPath(repeatInfo)) {
                            if (keys[i] === null || typeof keys[i] === 'undefined')
                                throw new Error('Instance keys to lists inconsistency.');

                            field = field.$get(keys[repeatsOffset]);
                            repeatsOffset = i + 1;
                            repeatFound = true;
                            break;
                        }
                    }

                    if (!repeatFound)
                        break;
                        // throw new Error('Instance keys to lists inconsistency.');
                }
            }

            return field;
        }

        getFullPath(repeatInfo)
        {
            let rawParts = this.getRawParts(repeatInfo);
            return rawParts.join('.');
        }

        getRawParts(repeatInfo)
        {
            let rawParts = this.parts.slice();

            /* Get all raw parts. */
            for (let i = repeatInfo.repeats.length - 1; i >= 0; i--) {
                if (rawParts[0] !== repeatInfo.repeats[i].itemName)
                    continue;

                rawParts.splice(0, 1);
                rawParts = repeatInfo.repeats[i].fieldInfo.parts.concat(rawParts);
                // rawParts.splice(0, 0, repeatInfo.repeats[i].fieldInfo.parts);
            }

            return rawParts;
        }

    }},


    RepeatInfo: { value:
    class LayoutParser_RepeatInfo {

        constructor(elementsStack)
        {
            this.repeats = [];
            this.virtual = false;

            for (let i = 0; i < elementsStack.length; i++) {
                let element = elementsStack[i];
    
                if ('repeat' in element.info) {
                    this.repeats.push(element.info.repeat);
                    this.virtual = true;
                }
            }
        }

        getKeys(fieldInfo, keys)
        {
            let repeatKeys = [];
            for (let i = 0; i < this.repeats.length; i++)
                repeatKeys.push(null);

            let rawFieldParts = fieldInfo.getRawParts(this);
            let fullFieldPath = rawFieldParts.join('.');
            let keysIndex = keys.length - 1;
            
            for (let i = this.repeats.length - 1; i >= 0; i--) {
                let repeatFieldPath = this.repeats[i].fieldInfo
                        .getFullPath(this);
                if (fullFieldPath.indexOf(repeatFieldPath) === 0) {
                    repeatKeys[i] = keys[keysIndex];
                    keysIndex--;
                    if (keysIndex < 0)
                        break;
                    // fullFieldPath = fullFieldPath.substring(repeatFieldPath.length);
                    // if (fullFieldPath[0] === '.')
                    //     fullFieldPath = fullFieldPath.substring(1);
                }
            }
            
            return repeatKeys;
        }

    }},

});