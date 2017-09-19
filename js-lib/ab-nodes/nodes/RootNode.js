'use strict';

const abTypes = require('ab-types');

const HtmlElement = require('../HtmlElement');
const Node = require('../Node');


class RootNode extends Node
{

    constructor(html_element)
    { super();
        abTypes.argsE(arguments, HTMLElement);
        abTypes.prop(this, RootNode.PChildren, this);

        this._htmlElement = html_element;
    }


    /* Node.IListener */
    __onNodeActivate()
    {
        HtmlElement.ClearChildren(this._htmlElement);

        for (let i = 0; i < this.children.length; i++)
            this.children.get(i).activate();
    }

    __onNodeDeactivate()
    {
        for (let i = 0; i < this.children.length; i++)
            this.children.get(i).deactivate();
    }

    __getNodeHtmlElement()
    {
        return this._htmlElement;
    }

    __getNodeFirstHtmlElement()
    {
        return this._htmlElement;
    }
    /* / Node.IListener */




}
module.exports = RootNode;


Object.defineProperties(RootNode, {

    PChildren: { value:
    class RootNode_PChildren extends Node.PChildren
    {

        __onAddChild(child_node)
        {
            if (this.__node.active)
                child_node.activate();
        }

        __getNext(child_node)
        {
            return this.getNext(child_node);
        }

    }},

});
