'use strict';

const abFields = require('../ab-fields');
const abLayouts = require('../ab-layouts');
const abNodes = require('../ab-nodes');
const abTypes = require('ab-types');

const LayoutInfo = require('./LayoutInfo');


class LayoutParser extends abLayouts.Parser
{

    constructor()
    { super();
        this._fields = null;
    }

    getFields()
    {
        return this._fields;
    }


    _createNode(node_info)
    {
        let element = new abLayouts.Parser.Element(null, null, null);

        this._createNode_Show(node_info, element);
        this._createNode_Repeat(node_info, element);
        this._createNode_Single(node_info, element);

        return element;
    }

    _createNode_UpdateElement(element, new_bottom_node)
    {
        if (element.topNode === null)
            element.topNode = new_bottom_node;
        if (element.bottomNode !== null)
            element.bottomNode.children.add(new_bottom_node);
        element.bottomNode = new_bottom_node;
    }

    _createNode_Repeat(node_info, element)
    {
        if (!('_repeat' in node_info.attribs))
            return;

        let node = new abNodes.RepeatNode();
        this._createNode_UpdateElement(element, node);

        let [ field_path, virtual ] = this._parseFieldPath(
                node_info.attribs._repeat[0]);

        this._fields.$define(field_path, {
            onDelete: (key) => {
                node.delete(key);
            },
            onSet: (key, value) => {
                node.add(key);
            },
        });
        if (!virtual)
            this._fields.$set(field_path, new Map());
    }

    _createNode_Single(node_info, element)
    {
        let node = new abNodes.SingleNode(node_info.type);
        this._createNode_UpdateElement(element, node);
    }

    _createNode_Show(node_info, element)
    {
        if (!('_show' in node_info.attribs))
            return;

        let node = new abNodes.ShowNode();
        this._createNode_UpdateElement(element, node);

        let [ field_path, virtual ]= this._parseFieldPath(
                node_info.attribs._show[0]);

        this._fields.$define(field_path, {
            onChange: (value) => {
                node.show = value ? true : false;
            },
        });
        if (!virtual)
            this._fields.$set(field_path, false);
    }

    _createTextNode(node_info)
    {
        let text_node = new abNodes.TextNode(node_info.content[0] === '$' ?
                null : node_info.content);

        if (node_info.content[0] === '$') {
            let [ field_path, virtual ] = this._parseFieldPath(
                    node_info.content.substring(1));

            this._fields.$define(field_path, {
                onChange: (value) => {
                    text_node.text = value;
                },
            });
            if (!virtual)
                this._fields.$set(field_path, '');
        }

        return [ text_node, text_node, null ];
    }

    _parseFieldPath(elements_stack, field_path)
    {
        let virtual = field_path.indexOf('*') !== -1;

        for (let i = elements_stack.length - 1; i >=0; i--) {
            let repeat_field_path = elements_stack[i].info.repeatField;
            let repeat_field_infos = element_info.repeatFieldInfos;

            for (let repeat_field_info of repeat_field_infos) {
                let regexp = new RegExp(`^${repeat_field_info.name}\.`);
                if (field_path.match(regexp))
                    field_path.replace(regexp, repeat_field_info.path);
            }
        }

        return [ field_path, virtual ];
    }


    /* abLayouts.Parser Overrides */
    __createNode(node_info, elements_stack)
    {
        if (node_info.type === '_text')
            return this._createTextNode(node_info, elements_stack)
        else
            return this._createElement(node_info, elements_stack);
    }

    __onParse()
    {
        this._fields = new abFields.RootField();
        this._repeatFieldPathsStack = [];
    }
    /* / abLayouts.Parser Overrides */

}
module.exports = LayoutParser;
