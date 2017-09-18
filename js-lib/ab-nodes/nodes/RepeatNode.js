'use strict';

const abTypes = require('../../ab-types');

const HtmlElement = require('../HtmlElement');
const Node = require('../Node');

const TextNode = require('./TextNode');


class RepeatNode extends Node
{

    constructor()
    { super();
        abTypes.prop(this, RepeatNode.PChildren, this);

        this._instances = [];
    }

    pop()
    {
        if (this._instances.length <= 0)
            throw new Error('Cannot `pop` on empty `RepeatNode`.');

        let last_instance = this._instances.pop();

        if (this.active)
            last_instance.deactivate();
    }

    push()
    {
        let instance = new RepeatNode.InstanceNode(this);

        this._instances.push(instance);
        for (let i = 0; i < this.children.length; i++) {
            let new_child_node = this.children.get(i).copyable.copy(true);

            instance.children.add(new_child_node);
        }

        if (this.active)
            instance.activate();
    }


    /* Node */
    __onNodeActivate()
    {
        abTypes.assert(this.parentNode !== null, 'Parent node not set.');

        for (let i = 0; i < this._instances.length; i++)
            this._instances[i].activate();
    }

    __onNodeDeactivate()
    {
        for (let i = 0; i < this._instances.length; i++)
            this._instances[i].deactivate();
    }

    __getNodeHtmlElement()
    {
        abTypes.assert(this.parentNode !== null, 'Parent node not set.');

        return this.parentNode.htmlElement;
    }

    __getNodeFirstHtmlElement()
    {
        return this._instances.length === 0 ?
                null : this._instances[0].firstHtmlElement;
    }
    /* / Node */

}
module.exports = RepeatNode;


RepeatNode.PChildren = class extends Node.PChildren {

    __onAddChild(child_node, next_node)
    {
        abTypes.implements(child_node, Node.PCopyable);

        if (next_node === null)
            child_node._nextNode = this._nextNode;

        if (this.show)
            child_node.activate();
    }

    __getNext(child_node)
    {
        let next_node = this.findNext(child_node);
        if (next_node !== null)
            return next_node;

        return this.nextNode;
    }

};


RepeatNode.InstanceNode =  class extends Node
{

    constructor(repeat_node)
    { super();
        abTypes.prop(this, RepeatNode.InstanceNode.PChildren, this);
        abTypes.args(arguments, RepeatNode);

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

};


RepeatNode.InstanceNode.PChildren = class extends Node.PChildren
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

};
