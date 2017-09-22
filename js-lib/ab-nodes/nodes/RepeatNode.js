'use strict';

const abTypes = require('ab-types');

const HtmlElement = require('../HtmlElement');
const Node = require('../Node');

const TextNode = require('./TextNode');


class RepeatNode extends Node
{

    constructor()
    { super();
        abTypes.prop(this, RepeatNode.PChildren, this);

        this._instances = new Map();
    }

    add(key)
    {
        if (this._instances.has(key))
            throw new Error(`Instance with ket \`${key}\` already exists.`);

        let instance = new RepeatNode.InstanceNode(this);

        this._instances.set(key, instance);
        for (let i = 0; i < this.children.length; i++) {
            let new_child_node = this.children.get(i).copyable.copy(true);

            instance.children.add(new_child_node);
        }

        if (this.active)
            instance.activate();
    }

    delete(key)
    {
        if (!this._instances.has(key))
            throw new Error(`Instance with key \`${key}\ does not exist.`);

        let instance = this._instances.get(key);

        if (this.active)
            instance.deactivate();
    }

    pop()
    {
        if (this._instances.size <= 0)
            throw new Error('Cannot `pop` on empty `RepeatNode`.');

        let key = Array.from(this._instances.keys)[this._instances.size - 1];
        let last_instance = this._instances.get(key);

        if (this.active)
            last_instance.deactivate();
    }

    push()
    {
        let index = 0;
        while(this._instances.has(index))
            index++;

        this.set(index);
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


Object.defineProperties(RepeatNode, {

    PChildren: { value:
    class extends Node.PChildren {

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

    }},

});


require('./RepeatNode.InstanceNode');
