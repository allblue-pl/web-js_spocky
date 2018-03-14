'use strict';

const abNodes = require('../ab-nodes');
const abTypes = require('ab-types');


class LayoutNode extends abNodes.Node
{

    constructor()
    { super();
        abTypes.prop(this, LayoutNode.PChildren);

        // this._idNodes = {};
    }

    // setIds(id_nodes)
    // {
    //     abTypes.argsE(arguments, 'object');
    //
    //     this._idNodes = id_nodes;
    // }


    /* Node */
    __onActivate()
    {
        for (let i = 0; i < this.pChildren.length; i++) {
            // console.log('LayoutNode', this.pChildren.get(i));
            this.pChildren.get(i).activate();
        }
    }

    __onDeactivate()
    {
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
module.exports = LayoutNode;


Object.defineProperties(LayoutNode, {

    PChildren: { value:
    class LayoutNode_PChildren extends abNodes.Node.PChildren
    {

        __onAddChild(child_node, next_node)
        {
            if (next_node === null)
                child_node._nextNode = this._nextNode;

            if (this.active)
                child_node.activate();
        }

        __getNext(child_node)
        {
            let next_node = this.findNext(child_node);
            if (next_node !== null)
                return next_node;

            return this.__main.nextNode;
        }

    }}

});
