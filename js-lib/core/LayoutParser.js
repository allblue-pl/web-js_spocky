'use strict';

const abFields = require('../ab-fields');
const abLayouts = require('../ab-layouts');
const abNodes = require('../ab-nodes');
const abTypes = require('ab-types');

const Elems = require('../instances/Elems');
const LayoutInfo = require('./LayoutInfo');


class LayoutParser extends abLayouts.Parser
{

    constructor()
    { super();
        this._fields = null;
        this._elems = null;
        this._nodes = null;
    }

    getElems()
    {
        return this._elems;
    }

    getFields()
    {
        return this._fields;
    }

    getNodes()
    {
        return this._nodes;
    }


    _createElement(node_info, elements_stack)
    {
        let element = new abLayouts.Parser.Element(null, null, []);

        this._createElement_AddShow(node_info, elements_stack, element);
        this._createElement_AddRepeat(node_info, elements_stack, element);
        let t_elements_stack = elements_stack.concat([ element ]);
        this._createElement_AddSingle(node_info, t_elements_stack, element);
        this._createElement_ParseElem(node_info, t_elements_stack,
                element.bottomNode);

        return element;
    }

    _createElement_AddRepeat(node_info, elements_stack, element)
    {
        if (!('_repeat' in node_info.attribs))
            return;

        let node = new abNodes.RepeatNode();
        this._createElement_UpdateElement(element, node);

        let repeat_info = this._parseRepeatField(node_info.attribs._repeat[0]);
        let [ define_field_path, virtual_field ] = this._parseFieldPath(
                elements_stack, repeat_info.repeatFieldPath);
        let repeat_instance_paths = this._getRepeatInstancePaths(elements_stack);

        if (repeat_instance_paths.length > 0) {
            node.pCopyable.onCreate((node_copy) => {
                let instance_keys = node_copy.pCopyable._instanceKeys;

                let object_field = null;
                let object_found = false;
                for (let i = repeat_instance_paths.length - 1; i >= 0; i--) {
                    if (define_field_path.indexOf(
                            `${repeat_instance_paths[i]}.`) === 0) {
                        let field_path = this._getFieldPath_FromDefine(
                                define_field_path, instance_keys, i);

                        object_field = this._fields.$get(field_path);
                        object_found = true;
                        break;
                    }
                }

                if (!object_found)
                    object_field = this._fields.$get(define_field_path);

                if (typeof object_field === 'undefined')
                    return;

                for (let [ key, value ] of object_field)
                    node_copy.add(key);

                return;
            });

            this._fields.$define(define_field_path, {
                onDelete: (key, field_path) => {
                    let instance_keys = this._getInstanceKeys(
                            repeat_instance_paths, field_path);
                    let node_copies = node.pCopyable.getNodeCopies(
                            instance_keys);

                    for (let node_copy of node_copies)
                        node_copy.delete(key);
                },
                onSet: (key, value, field_path) => {
                    let instance_keys = this._getInstanceKeys(
                            repeat_instance_paths, field_path);
                    let node_copies = node.pCopyable.getNodeCopies(
                            instance_keys);

                    for (let node_copy of node_copies)
                        node_copy.add(key);
                }
            });
        } else {
            this._fields.$define(define_field_path, {
                onDelete: (key, field_path) => {
                    node.delete(key);
                },
                onSet: (key, value, field_path) => {
                    node.add(key);
                },
            });
        }

        if (!virtual_field) {
            if (!this._fields.$exists(define_field_path)) {
                this._fields.$set(define_field_path, new Map());
            }
        }

        element.info.repeatFieldInfo = {
            repeatNode: node,

            varName: repeat_info.itemVarName,
            keyVarName: repeat_info.keyVarName,
            fieldPath: define_field_path,
        };

        if ('_id' in node_info.attribs)
            this._nodes.set(`${node_info.attribs._id}.repeat`, node);
    }

    _createElement_AddSingle(node_info, elements_stack, element)
    {
        let node = new abNodes.SingleNode(node_info.type);
        this._createElement_UpdateElement(element, node);

        if ('_id' in node_info.attribs)
            this._nodes.set(`${node_info.attribs._id}.single`, node);
    }

    _createElement_AddShow(node_info, elements_stack, element)
    {
        if (!('_show' in node_info.attribs))
            return;

        let node = new abNodes.ShowNode();
        this._createElement_UpdateElement(element, node);

        let [ field_path, virtual ] = this._parseFieldPath(
                elements_stack, node_info.attribs._show[0]);

        this._fields.$define(field_path, {
            onChange: (value) => {
                node.show = value ? true : false;
            },
        });
        if (!virtual)
            this._fields.$set(field_path, false);

        if ('_id' in node_info.attribs)
            this._nodes.set(`${node_info.attribs._id}.show`, node);
    }

    _createElement_AddText(node_info, elements_stack, element)
    {
        let node_content = '_content' in node_info.attribs ?
                node_info.attribs._content[0] : null;
        let node = this._createTextNode(node_content, elements_stack);

        this._createElement_UpdateElement(element, node);

        if ('_id' in node_info.attribs)
            this._nodes.set(`${node_info.attribs._id}.text`, node);
    }

    _createElement_ParseElem(node_info, elements_stack, single_node)
    {
        if (!('_elem' in node_info.attribs))
            return;

        // let virtual_element = this._isElementVirtual(elements_stack);
        let repeat_instance_paths = this._getRepeatInstancePaths(elements_stack);

        if (repeat_instance_paths.length > 0) {
            // let regexp = /^([a-zA-Z0-9\_]+)(\(([a-zA-Z0-9\_, ]+)\))?$/;
            // let match = regexp.exec(node_info.attribs._elem[0]);
            //
            // let args = match[3] === null ? [] : match[3].replace(/ /g, '').split(',');
            // let virtual = true;
            // for (let i = 0; i < args.length; i++) {
            //     let [ define_field_path, virtual ] = this._parseFieldPath(
            //             elements_stack, args[i]);
            // }

            this._elems._$addVirtual(node_info.attribs._elem[0], single_node);

        } else {
            this._elems._$addStatic(node_info.attribs._elem[0],
                    single_node.htmlElement);
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

    _createContentElement(node_info, elements_stack)
    {
        let node = this._createTextNode(node_info.content, elements_stack);

        return new abLayouts.Parser.Element(node, node, null);
    }

    _createTextElement(node_info, elements_stack)
    {
        let element = new abLayouts.Parser.Element(null, null, []);

        this._createElement_AddShow(node_info, elements_stack, element);
        this._createElement_AddRepeat(node_info, elements_stack, element);
        this._createElement_AddText(node_info, elements_stack, element);

        return element;
    }

    _createTextNode(node_content, elements_stack)
    {
        let node = new abNodes.TextNode(node_content[0] === '$' ?
                null : node_content);

        if (node_content[0] === '$') {
            let [ define_field_path, virtual_field ] = this._parseFieldPath(
                    elements_stack, node_content.substring(1));
            let repeat_instance_paths = this._getRepeatInstancePaths(elements_stack);

            let is_key = define_field_path[define_field_path.length - 1] === '?';

            if (repeat_instance_paths.length > 0) {
                node.pCopyable.onCreate((node_copy) => {
                    let instance_keys = node_copy.pCopyable._instanceKeys;

                    for (let i = repeat_instance_paths.length - 1; i >= 0; i--) {
                        if (define_field_path.indexOf(
                                `${repeat_instance_paths[i]}.`) === 0) {
                            if (is_key)
                                node_copy.text = instance_keys[instance_keys.length - 1];
                            else {
                                let field_path = this._getFieldPath_FromDefine(
                                        define_field_path, instance_keys, i);
                                node_copy.text = this._fields.$get(field_path);
                            }

                            return;
                        }
                    }

                    node_copy.text = this._fields.$get(define_field_path);
                });

                this._fields.$define(define_field_path, {
                    onChange: (value, field_name, field_path) => {
                        let instance_keys = this._getInstanceKeys(
                                repeat_instance_paths, field_path);
                        let node_copies = node.pCopyable.getNodeCopies(
                                instance_keys);

                        for (let node_copy of node_copies)
                                node_copy.text = value;
                    }
                });
            } else {
                this._fields.$define(define_field_path, {
                    onChange: (value, field_path) => {
                        node.text = value;
                    },
                });
            }

            if (!virtual_field) {
                if (!this._fields.$exists(define_field_path))
                    this._fields.$set(define_field_path, '');
            }
        }

        return node;
    }

    _getRepeatInstancePaths(elements_stack)
    {
        let repeat_instance_keys = [];
        for (let element of elements_stack) {
            if ('repeatFieldInfo' in element.info)
                repeat_instance_keys.push(element.info.repeatFieldInfo.fieldPath);
        }

        return repeat_instance_keys;
    }

    _getRepeatFieldPath(elements_stack)
    {
        for (let i = elements_stack.length - 1; i >= 0; i--) {
            let element = elements_stack[i];
            if (!('repeatFieldInfo' in element.info))
                continue;

            let define_field_path = element.info.repeatFieldInfo.fieldPath;
            return this._parseFieldPath(elements_stack.slice(0, i - 1),
                    define_field_path)[0];
        }

        return null;
    }

    _getFieldPath_FromDefine(define_field_path, instance_keys, start_index)
    {
        let define_field_path_array = define_field_path.split('.');
        let field_path_array = [];
        let instance_keys_index = start_index;
        for (let define_field_path_part of define_field_path_array) {
            if (define_field_path_part === '*') {
                field_path_array.push(instance_keys[instance_keys_index]);
                instance_keys_index++;
            } else
                field_path_array.push(define_field_path_part);
        }

        return field_path_array.join('.');
    }

    _getInstanceKeys(instance_paths, field_path)
    {
        let instance_keys = [];
        let field_path_array = field_path.split('.');
        for (let instance_path of instance_paths) {
            let instance_path_array = instance_path.split('.');
            instance_path_array.push('*');

            let key = this._getInstanceKeys_ParsePath(instance_path_array,
                    field_path_array);
            instance_keys.push(key);
        }

        return instance_keys;
    }

    _getInstanceKeys_ParsePath(instance_path_array, field_path_array)
    {
        // console.log(instance_path_array, field_path_array);

        if (field_path_array.length < instance_path_array.length)
            return null;

        for (let i = 0; i < instance_path_array.length; i++) {
            let ip_part = instance_path_array[i];
            if (ip_part === '*' || ip_part === '?') {
                if (i === instance_path_array.length - 1)
                    return field_path_array[i];

                continue;
            }

            if (ip_part !== field_path_array[i])
                return null;
        }

        return null;
    }

    _getInstanceKeysFromPath(define_field_path, field_path, instance_keys)
    {
        let define_field_path_array = define_field_path.split('.');
        let field_path_array = field_path.split('.');

        for (let i = 0; i < define_field_path_array.length; i++) {
            if (define_field_path_array[i] === '*')
                instance_keys.push(field_path_array[i]);
        }

        return instance_keys;
    }

    _getNodeMatchingCopies(define_field_path, field_path, node,
            instance_keys, extra_instance_keys = [])
    {
        abTypes.implementsE(node, abNodes.Node.PCopyable);

        instance_keys = this._getInstanceKeysFromPath(define_field_path,
                field_path, instance_keys);
        instance_keys = instance_keys.concat(extra_instance_keys);
        let node_copies = node.pCopyable.getNodeCopies(instance_keys);

        let matching_node_copies = [];
        for (let node_copy of node_copies) {
            if (node_copy.pCopyable.matchInstanceKeys(instance_keys))
                matching_node_copies.push(node_copy);
        }

        return matching_node_copies;
    }

    _isElementVirtual(elements_stack)
    {
        for (let element of elements_stack) {
            if ('repeatFieldInfo' in element.info)
                return true;
        }

        return false;
    }

    _parseFieldPath(elements_stack, field_path)
    {
        for (let i = elements_stack.length - 1; i >=0; i--) {
            let element = elements_stack[i];

            if (!('repeatFieldInfo' in element.info))
                continue;

            let regexp = new RegExp(`^${element.info.repeatFieldInfo.varName}`);
            field_path = field_path.replace(regexp,
                    element.info.repeatFieldInfo.fieldPath + '.*');

            regexp = new RegExp(`^${element.info.repeatFieldInfo.keyVarName}`);
            field_path = field_path.replace(regexp,
                    element.info.repeatFieldInfo.fieldPath + '.?');
        }

        let virtual = field_path.indexOf('*') !== -1 ||
                field_path.indexOf('?') !== -1;

        return [ field_path, virtual ];
    }

    _parseRepeatField(field_content)
    {
        let regexp = /^\[?(([a-zA-Z0-9\_\., ]+)\]? +of +)?([a-zA-Z0-9\_\.]+)$/;
        let match = regexp.exec(field_content);

        let keyitem_array = typeof match[2] === 'undefined' ?
                [ '_key', '_item' ] : match[2].replace(/ /g, '').split(',');

        return {
            itemVarName: keyitem_array.length === 1 ? keyitem_array[0] : keyitem_array[1],
            keyVarName: keyitem_array.length === 1 ? '_key' : keyitem_array[0],
            repeatFieldPath: match[3],
        };
    }


    /* abLayouts.Parser Overrides */
    __createElement(node_info, elements_stack)
    {
        if (node_info.type === '_content')
            return this._createContentElement(node_info, elements_stack);
        else if (node_info.type === '_text')
            return this._createTextElement(node_info, elements_stack);
        else
            return this._createElement(node_info, elements_stack);
    }

    __onParse()
    {
        this._fields = new abFields.RootField();
        this._elems = new Elems();
        this._nodes = new Map();
        this._repeatFieldPathsStack = [];
    }
    /* / abLayouts.Parser Overrides */

}
module.exports = LayoutParser;
