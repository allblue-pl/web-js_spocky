'use strict';

const abNodes = require('../ab-nodes');
const abTypes = require('ab-types');

const LayoutNode = require('./LayoutNode');


class Parser
{

    get __elementsStack() {
        return this._elementsStack;
    }


    constructor(layout_content)
    {
        this._elementsStack = null;
    }

    parse(layout_content)
    {
        abTypes.argsE(arguments, Array);

        this.__onParse();

        let layout_node = new LayoutNode();
        let id_nodes = {};

        let elements_stack = [];
        let parent_nodes_stack = [ null ];
        let parent_node_contents_stack = [ layout_content ];

        while (parent_nodes_stack.length > 0) {
            let parent_node = parent_nodes_stack[0];
            let parent_node_content = parent_node_contents_stack[0];

            for (let i = 0; i < parent_node_content.length; i++) {
                let node_info = this._parseNodeInfo(
                        parent_node_content[i]);

                let top_node = null;
                let bottom_node = null;
                let info = null;

                let node = this.__createNode(node_info, elements_stack);
                if (abTypes.var(node, abNodes.Node)) {
                    top_node = node;
                    bottom_node = node;
                } else if (abTypes.var(node, Parser.Element)) {
                    if (node.length !== 2) {
                        throw new Error(`\`__createNode\` must return \`Array\`` +
                                ` with exactly 2 elements.`);
                    }

                    [ top_node, bottom_node, info ] = node;
                    // top_node = node[0];
                    // bottom_node = node[1];
                } else
                    throw new Error(`\`__createNode\` must return \`Node\` or \`Array\`.`);

                // if ('_id' in node_info.attribs) {
                //     if (node_info.attribs._id in id_nodes) {
                //         console.warn('Node with id `' + node_info.attribs._id +
                //                 '` already exists.');
                //     }
                //     // id_nodes[node_info.attribs._id] = node;
                // }

                if (parent_node === null)
                    layout_node.children.add(top_node);
                else
                    parent_node.children.add(top_node);

                if (abTypes.implements(bottom_node, abNodes.Node.PChildren)) {
                    parent_nodes_stack.push(bottom_node);
                    parent_node_contents_stack.push(node_info.content);

                    elements_stack.push(new Parser.Element(top_node,
                            bottom_node, info));
                }
            }

            parent_nodes_stack.splice(0, 1);
            parent_node_contents_stack.splice(0, 1);
        }

        // layout_node.setIds(id_nodes);

        return layout_node;
    }


    _parseNodeInfo(node_info)
    {
        /* Validate */
        if (!abTypes.args(arguments, [ Array, 'string' ]) || node_info === null) {
            console.error('Error info:', node_info)
            throw new Error(`Node info must be an \`Array\` or \`string\`.`);
        }
        /* / Validate */
        if (node_info instanceof Array) {
            if (!abTypes.var(node_info[0], 'string')) {
                console.error('Error info:', node_info);
                throw new Error('First element of node info array must be a string.');
            }

            let node_type = node_info[0];
            let node_attribs = {};
            let node_content = [];
            for (let i = 1; i < node_info.length; i++) {
                /* Parse Args */
                if (abTypes.var(node_info[i], abTypes.RawObject)) {
                    for (let attrib_name in node_info[i]) {
                        let attrib_value = node_info[i][attrib_name];

                        if (!abTypes.var(attrib_value, [ 'string', Array ]) ||
                                attrib_value === null) {
                            console.error('Error info: ', node_info[i]);
                            throw new Error(`Node attrib must be \`string\` or \`Array\`.`);
                        }

                        if (!(attrib_name in node_attribs))
                            node_attribs[attrib_name] = [];

                        if (abTypes.var(attrib_value, 'string'))
                            node_attribs[attrib_name].push(attrib_value);
                        else
                            node_attribs[attrib_name] = node_attribs[attrib_name]
                                    .concat(attrib_value);
                    }
                /* Parse Node */
                } else
                    node_content.push(node_info[i]);
            }

            return {
                type: node_type,
                attribs: node_attribs,
                content: node_content,
            };
        } else {
            return {
                type: '_text',
                attribs: {},
                content: node_info,
            };
        }

        // let node_type = node_info_keys[0];
        // let node_content = node_info[node_type];
        // this._validateNodeContent(node_content);
        //
        // let node_attribs = this._parseNodeAttrs(node_type, node_content);
        // if (node_attribs !== null)
        //     node_content.splice(0, 1);
        //
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


    __onParse()
    {

    }


    __createNode(node_info) { abTypes.virtual(this); }

}
module.exports = Parser;


Object.defineProperties(Parser, {

    Element: { value:
    class
    {

        constructor(top_node, bottom_node, info)
        {
            this.topNode = top_node;
            this.bottomNode = bottom_node;
            this.info = info;
        }

    }},

});
