'use strict';

const abTypes = require('../../ab-types');

const HtmlElement = require('../HtmlElement');
const Node = require('../Node');


class SingleNode extends Node
{

    constructor(html_element_type)
    { super();
        abTypes.prop(this, SingleNode.PChildren, this);
        abTypes.prop(this, SingleNode.PCopyable, this, arguments);
        abTypes.args(arguments, 'string');

        this._htmlElement = document.createElement(html_element_type);
    }


    /* Node */
    __onNodeActivate()
    {
        abTypes.assert(this.parentNode !== null, 'Parent node not set.');

        console.log('Here', this.parentNode);

        HtmlElement.AddChild(this.parentNode.htmlElement, this._htmlElement,
                this.nextHtmlElement);
    }

    __onNodeDeactivate()
    {
        HtmlElement.RemoveChild(this.parentNode.htmlElement, this._htmlElement);
    }

    __getNodeHtmlElement()
    {
        return this._htmlElement;
    }

    __getNodeFirstHtmlElement()
    {
        if (!this.active)
            return null;

        return this._htmlElement;
    }
    /* / Node */

}
module.exports = SingleNode;


Object.defineProperties(SingleNode, {

    PChildren: { value:
    class SingleNode_PChildren extends Node.PChildren
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


    PCopyable: { value:
    class SingleNode_PCopyable extends Node.PCopyable
    {

        copy(deep_copy)
        {
            if (deep_copy && abTypes.implementsC(this.__node, Node.PChildren))
                return this.__node.children.copy();

            return new SingleNode(this.__args[0]);
        }

    }},

});
