'use strict';

const abTypes = require('../ab-types');

const HtmlElement = require('../HtmlElement');
const Node = require('../Node');


class FieldNode extends Node
{

    get length()
    {
        return this._show;
    }

    set length(show_value)
    {
        abTypes.args(arguments, 'boolean');

        if (show_value === this._show)
            return;
        this._show = show_value;

        if (show_value) {
            for (let i = 0; i < this.children.length; i++)
                this.children.get(i).activate();
        } else {
            for (let i = 0; i < this.children.length; i++)
                this.children.get(i).deactivate();
        }
    }


    constructor()
    { super();
        this.__setListeners(this, this);

        this._show = false;
    }


    /* Node */
    __onNodeActivate()
    {
        abTypes.assert(this.parentNode !== null, 'Parent node not set.');

        if (!this.show)
            return;

        for (let i = 0; i < this.children.length; i++)
            this.children.get(i).activate();
    }

    __onNodeDeactivate()
    {
        if (!this.show)
            return;

        for (let i = 0; i < this.children.length; i++)
            this.children.get(i).deactivate();
    }

    __getNodeHtmlElement()
    {
        abTypes.assert(this.parentNode !== null, 'Parent node not set.');

        return this.parentNode.htmlElement;
    }

    __getNodeFirstHtmlElement()
    {
        return this.children.length === 0 ?
                null : this.children.get(0).firstHtmlElement;
    }
    /* / Node */


    /* Node.Children */
    __onAddNodeChild(child_node, next_node)
    {
        if (next_node === null)
            child_node._nextNode = this._nextNode;

        if (this.show)
            child_node.activate();
    }

    __getChildNodeNextNode(child_node)
    {
        let next_node = this.children.getNext(child_node);
        if (next_node !== null)
            return next_node;

        return this.nextNode;
    }
    /* / Node.Children */

}

module.exports = FieldNode;
