'use strict';

const abNodes = require('../ab-nodes');
const abTypes = require('ab-types');


class ElementNode extends abNodes.Node
{

    constructor(html_element_type)
    { super();
        abTypes.argsE(arguments, 'string');
        abTypes.prop(this, ElementNode.PChildren, this);
    }


    /* Node */
    __onNodeActivate()
    {
        let nodes = Array.from(this._nodes.values());
        for (let i = 0; i < nodes.length; i++)
            nodes[i].activate();
    }

    __onNodeDeactivate()
    {
        let nodes = Array.from(this._nodes.values());
        for (let i = nodes.length - 1; i >= 0; i--)
            nodes[i].deactivate();
    }

    __getNodeHtmlElement()
    {
        abTypes.assert(this._nodes.size > 0, `\`ElementNode\` is empty.`);

        let nodes = Array.from(this._nodes.values());

        return nodes[this._nodes.size - 1].htmlElement;
    }

    __getNodeFirstHtmlElement()
    {
        abTypes.assert(this._nodes.size > 0, `\`ElementNode\` is empty.`);

        let nodes = Array.from(this._nodes.values());

        return nodes[0].firstHtmlElement;
    }
    /* / Node */

}
module.exports = ElementNode;


Object.defineProperties(ElementNode, {

    PChildren: { value:
    class ElementNode_PChildren extends abNodes.Node.PChildren
    {

        __onAddChild(child_node, next_node)
        {
            child_node.activate();
        }

        __getNext(child_node)
        {
            return this.getNext(child_node);
        }

    }},


    // Presets: { value:
    // new abTypes.Presets({
    //     field: {
    //         required: false,
    //         type: 'boolean',
    //     },
    //     repeat: {
    //         required: false,
    //         type: 'boolean',
    //     },
    //     show: {
    //         required: false,
    //         type: 'boolean',
    //     },
    //     single: {
    //         required: false,
    //         type: 'boolean',
    //     },
    //     text: {
    //         required: false,
    //         type: 'boolean',
    //     },
    // })},

    _NodeTypes: { value:
    {
        show: abNodes.ShowNode,
        single: abNodes.SingleNode,
        text: abNodes.TextNode,
    }}

});
