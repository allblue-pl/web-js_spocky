'use strict';

const abNodes = require('../ab-nodes');
const abTypes = require('../ab-types');

const LayoutNode = require('./LayoutNode');


class Parser
{

    constructor(layout_content)
    {

    }

    parse(layout_content)
    {
        abTypes.args(arguments, Array);

        let layout_node = new LayoutNode();
        let id_nodes = {};

        let parent_nodes_stack = [ null ];
        let parent_node_contents_stack = [ layout_content ];

        while (parent_nodes_stack.length > 0) {
            let parent_node = parent_nodes_stack[0];
            let parent_node_content = parent_node_contents_stack[0];

            for (let i = 0; i < parent_node_content.length; i++) {
                let node_info = this._parseNodeInfo(
                        parent_node_content[i]);

                let node = this.__createNode(node_info);
                if ('_id' in node_info.attribs) {
                    if (node_info.attribs._id in id_nodes) {
                        console.warn('Node with id `' + node_info.attribs._id +
                                '` already exists.');
                    }
                    id_nodes[node_info.attribs._id] = node;
                }

                if (parent_node === null)
                    layout_node.children.add(node);
                else
                    parent_node.children.add(node);

                if (abTypes.implementsC(node, abNodes.Node.PChildren)) {
                    parent_nodes_stack.push(node);
                    parent_node_contents_stack.push(node_info.content);
                }
            }

            parent_nodes_stack.splice(0, 1);
            parent_node_contents_stack.splice(0, 1);
        }

        layout_node.setIds(id_nodes);
        
        return layout_node;
    }


    _parseNodeInfo(node_info)
    {
        /* Validate */
        if (typeof node_info !== 'object') {
            console.error('Error info:', node_info)
            throw new Error('Node info is not an object.');
        }

        let node_info_keys = Object.keys(node_info);
        if (node_info_keys.length !== 1) {
            console.error('Error info:', node_info);
            throw new Error('Node info must contain exactly one key.');
        }
        /* / Validate */

        let node_type = node_info_keys[0];
        let node_content = node_info[node_type];
        this._validateNodeContent(node_content);

        let node_attribs = this._parseNodeAttrs(node_type, node_content);
        if (node_attribs !== null)
            node_content.splice(0, 1);

        return {
            type: node_type,
            attribs: node_attribs === null ? {} : node_attribs,
            content: node_content,
        };
    }

    _parseNodeAttrs(node_type, node_content)
    {
        if (node_content === null)
            return null;
        if (node_content.length === 0)
            return null;
        if (Object.keys(node_content[0]).length === 0)
            return {};

        let attribs = null;
        for (let attrib_name in node_content[0]) {
            if (attrib_name[0] !== '_') {
                if (attribs !== null) {
                    console.error('Error info:', { node_type:  node_content });
                    new Error('Only attribs are allowed in first content element.');
                }

                continue;
            }

            if (attribs === null)
                attribs = {};

            attribs[attrib_name] = node_content[0][attrib_name];
        }

        return attribs;
    }

    _validateNodeContent(node_content)
    {
        if (node_content !== null) {
            if (!(node_content instanceof Array)) {
                console.error('Error info:', node_type, node_content);
                throw new Error('Node content must be `null` or `Array`.');
            }
        }
    }


    __createNode(node_info) { abTypes.virtual(); }

}
module.exports = Parser;
