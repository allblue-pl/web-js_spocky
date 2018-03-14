'use strict';

const abTypes = require('ab-types');

const HtmlElement = require('../HtmlElement');
const Node = require('../Node');


class RootNode extends Node
{

    constructor(html_element)
    { super();
        abTypes.argsE(arguments, HTMLElement);
        abTypes.prop(this, RootNode.PChildren);

        this._htmlElement = html_element;
    }


    /* Node.IListener */
    __onActivate()
    {
        HtmlElement.ClearChildren(this._htmlElement);

        for (let i = 0; i < this.pChildren.length; i++)
            this.pChildren.get(i).activate();
    }

    __onDeactivate()
    {
        for (let i = 0; i < this.pChildren.length; i++)
            this.pChildren.get(i).deactivate();
    }

    __getHtmlElement()
    {
        return this._htmlElement;
    }

    __getFirstHtmlElement()
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
            if (this.__main.active)
                child_node.activate();
        }

    }},

});
