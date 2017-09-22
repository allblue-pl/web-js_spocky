'use strict';

const abTypes = require('ab-types');

const Node = require('../Node');


class HideNode extends Node
{

    get hide() {
        return this._hide;
    }
    set hide(hide_value) {
        abTypes.argsE(arguments, 'boolean');

        if (hide_value === this._hide)
            return;
        this._hide = hide_value;

        if (hide_value) {
            if (this.active) {
                for (let i = 0; i < this.children.length; i++)
                    this.children.get(i).activate();
            }
        } else {
            for (let i = 0; i < this.children.length; i++)
                this.children.get(i).deactivate();
        }
    }


    constructor()
    { super();
        abTypes.prop(this, HideNode.PChildren, this);

        this._hide = false;
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

        for (let i = this.children.length - 1; i >= 0; i--)
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

}
module.exports = HideNode;


Object.defineProperties(HideNode, {

    PChildren: { value:
    class HideNode_PChildren extends Node.PChildren
    {

        __onAddChild(child_node, next_node)
        {
            // if (next_node === null)
            //     child_node._nextNode = this._nextNode;

            if (this.__node.active && this.__node.show)
                child_node.activate();
        }

        __getNext(child_node)
        {
            let next_node = this.getNext(child_node);
            if (next_node !== null)
                return next_node;

            return this.__node.nextNode;
        }

    }},

});
