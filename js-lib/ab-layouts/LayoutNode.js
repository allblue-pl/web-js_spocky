'use strict';

const abNodes = require('../ab-nodes');
const abTypes = require('../ab-types');


class LayoutNode extends abNodes.Node
{

    constructor()
    { super();
        abTypes.prop(this, LayoutNode.PChildren, this);

        this._idNodes = {};
    }

    setIds(id_nodes)
    {
        abTypes.args(arguments, 'object');

        this._idNodes = id_nodes;
    }


    /* Node */
    __onNodeActivate()
    {
        for (let i = 0; i < this.children.length; i++)
            this.children.get(i).activate();
    }

    __onNodeDeactivate()
    {
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
            let next_node = this.getNext(child_node);
            if (next_node !== null)
                return next_node;

            return this.__node.nextNode;
        }

    }}

});
