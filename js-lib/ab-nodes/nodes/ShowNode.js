'use strict';

const abTypes = require('ab-types');

const Node = require('../Node');


class ShowNode extends Node
{

    get show()
    {
        return this._show;
    }

    set show(show_value)
    {
        abTypes.argsE(arguments, 'boolean');

        if (show_value === this._show)
            return;
        this._show = show_value;

        if (show_value) {
            if (this.active) {
                for (let i = 0; i < this.pChildren.length; i++)
                    this.pChildren.get(i).activate();
            }
        } else {
            for (let i = 0; i < this.pChildren.length; i++)
                this.pChildren.get(i).deactivate();
        }
    }


    constructor()
    { super();
        abTypes.prop(this, ShowNode.PChildren);

        this._show = false;
    }


    /* Node */
    __onActivate()
    {
        abTypes.assert(this.parentNode !== null, 'Parent node not set.');

        if (!this.show)
            return;

        for (let i = 0; i < this.pChildren.length; i++)
            this.pChildren.get(i).activate();
    }

    __onDeactivate()
    {
        if (!this.show)
            return;

        for (let i = this.pChildren.length - 1; i >= 0; i--)
            this.pChildren.get(i).deactivate();
    }

    __getHtmlElement()
    {
        abTypes.assert(this.parentNode !== null, 'Parent node not set.');

        return this.parentNode.htmlElement;
    }

    __getFirstHtmlElement()
    {
        return this.pChildren.length === 0 ?
                null : this.pChildren.get(0).firstHtmlElement;
    }
    /* / Node */

}
module.exports = ShowNode;


Object.defineProperties(ShowNode, {

    PChildren: { value:
    class ShowNode_PChildren extends Node.PChildren
    {

        __onAddChild(child_node, next_node)
        {
            // if (next_node === null)
            //     child_node._nextNode = this._nextNode;

            if (this.__main.active && this.__main.show)
                child_node.activate();
        }

        __getNext(child_node)
        {
            let next_node = this.findNext(child_node);
            if (next_node !== null)
                return next_node;

            return this.__main.nextNode;
        }

    }},

});
