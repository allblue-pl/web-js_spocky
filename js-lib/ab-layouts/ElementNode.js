'use strict';

const abNodes = require('../ab-nodes');
const abTypes = require('../ab-types');


class ElementNode extends Node
{

    constructor(presets = {})
    { super();
        abTypes.args(arguments, ElementNode.Presets);

        this._nodes = {};


    }


    /* Node */
    __onNodeActivate()
    {
        let node_types = Object.keys(ElementNode._NodeTypes);
        for (let i = 0; i < node_types.length; i++) {
            if (node_types[i] in this._nodes)
                this._nodes[node_types[i]].activate();
        }
    }

    __onNodeDeactivate()
    {
        let node_types = Object.keys(ElementNode._NodeTypes);
        for (let i = node_types.length - 1; i >= 0; i--) {
            if (node_types[i] in this._nodes)
                this._nodes[node_types[i]].deactivate();
        }
    }

    __getNodeHtmlElement()
    {
        let node_types = Object.keys(ElementNode._NodeTypes);
        for (let i = node_types.length - 1; i >= 0; i--) {
            if (node_types[i] in this._nodes)
                return this._nodes[node_types[i]].htmlElement;
        }

        abTypes.assert(false, `\`ElementNode\` is empty.`);
    }

    __getNodeFirstHtmlElement()
    {
        let node_types = Object.keys(ElementNode._NodeTypes);
        for (let i = 0; i < node_types.length; i++) {
            if (node_types[i] in this._nodes)
                return this._nodes[node_types[i]].firstHtmlElement;
        }

        abTypes.assert(false, `\`ElementNode\` is empty.`);
    }
    /* / Node */

}
module.exports = ElementNode;


Object.defineProperties(ElementNode, {

    Presets: { value:
    new abTypes.Presets({
        field: {
            required: false,
            type: 'boolean',
        },
        repeat: {
            required: false,
            type: 'boolean',
        },
        show: {
            required: false,
            type: 'boolean',
        },
        single: {
            required: false,
            type: 'boolean',
        },
        text: {
            required: false,
            type: 'boolean',
        },
    })},

    _NodeTypes: { value:
    {
        show: abNodes.ShowNode,
        single: abNodes.SingleNode,
        text: abNodes.TextNode,
    }}

});
