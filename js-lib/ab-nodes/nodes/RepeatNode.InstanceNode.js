'use strict';

const RepeatNode = require('./RepeatNode');

const Node = require('../Node');


Object.defineProperty(RepeatNode, 'InstanceNode', { value:
class RepeatNode_InstanceNode extends Node
{

    constructor(repeat_node)
    { super();
        abTypes.argsE(arguments, RepeatNode);
        abTypes.prop(this, RepeatNode.InstanceNode.PChildren, this);

        this._repeatNode = repeat_node;
    }


    /* Node */
    __onNodeActivate()
    {
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
        return this._repeatNode.htmlElement;
    }

    __getNodeFirstHtmlElement()
    {
        return this.children.length === 0 ? null : this.children.get(0).firstHtmlElement;
    }
    /* / Node */

}, });
module.exports = RepeatNode.InstanceNode;


Object.defineProperties(RepeatNode.InstanceNode, {

    PChildren: { value:
    class RepeatNode_InstanceNode_PChildren extends Node.PChildren
    {

        constructor(node)
        { super(node);

        }

        __onAddChild(child_node, next_node)
        {
            if (this.__node.active)
                child_node.activate();
        }

        __getNext(child_node)
        {
            let next_node = this.getNext(child_node);
            if (next_node !== null)
                return next_node;

            let instance_index = this.__node._repeatNode._instances.indexOf(this.__node);
            abTypes.assert(instance_index !== -1, 'Instance not in repeat node.');

            if (instance_index === this.__node._repeatNode._instances.length - 1)
                return this.__node._repeatNode.nextNode;

            return this.__node._repeatNode._instances[instance_index + 1].firstHtmlElement;
        }

    }}

});
