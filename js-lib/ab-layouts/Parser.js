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

        let parents_stack = [{
            node: null,
            nodeContent: layout_content,
            elements: [],
        }];

        while (parents_stack.length > 0) {
            let parent = parents_stack.pop();

            for (let i = 0; i < parent.nodeContent.length; i++) {
                let node_info = this._parseNodeInfo(parent.nodeContent[i]);

                let element = this.__createElement(node_info, parent.elements);
                if (!abTypes.var(element, Parser.Element)) {
                    throw new Error(`\`__createNode\` must return` +
                            ` \`abLayout.Parser.Element\` object.`);
                }

                // if ('_id' in node_info.attribs) {
                //     if (node_info.attribs._id in id_nodes) {
                //         console.warn('Node with id `' + node_info.attribs._id +
                //                 '` already exists.');
                //     }
                //     // id_nodes[node_info.attribs._id] = node;
                // }

                if (parent.node === null)
                    layout_node.pChildren.add(element.topNode);
                else
                    parent.node.pChildren.add(element.topNode);

                if (abTypes.implements(element.bottomNode, abNodes.Node.PChildren)) {
                    parents_stack.push({
                        node: element.bottomNode,
                        nodeContent: node_info.content,
                        elements: parent.elements.concat([ element ]),
                    });
                }
            }

            // parent_nodes_stack.pop();
            // parent.nodeContents_stack.pop();
            // return;
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
                type: '_content',
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

    // _validateNodeContent(node_type, node_content)
    // {
    //     if (node_content !== null) {
    //         if (!(node_content instanceof Array)) {
    //             console.error('Error info:', node_type, node_content);
    //             throw new Error('Node content must be `null` or `Array`.');
    //         }
    //     }
    // }


    __onParse()
    {

    }


    __createElement(node_info) { abTypes.virtual(this); }

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
