'use strict';

const abTypes = require('ab-types');

const HtmlElement = require('../HtmlElement');
const Node = require('../Node');

const TextNode = require('./TextNode');


class RepeatNode extends Node
{

    constructor()
    { super();
        abTypes.prop(this, RepeatNode.PChildren);
        abTypes.prop(this, RepeatNode.PCopyable, arguments);

        this._instances = new abTypes.List();
    }

    add(key)
    {
        if (this._instances.has(key))
            throw new Error(`Instance with key \`${key}\` already exists.`);

        let instance = new RepeatNode.InstanceNode(this, key);

        this._instances.set(key, instance);
        let original_node = this.pCopyable.getOriginalNode();

        let instance_keys = this.pCopyable._instanceKeys.concat([ key ]);
        for (let i = 0; i < original_node.pChildren.length; i++) {
            let new_child_node = original_node.pChildren.get(i).pCopyable
                    .createCopy(instance_keys);
            instance.pChildren.add(new_child_node);
        }

        if (this.active)
            instance.activate();
    }

    delete(key)
    {
        if (!this._instances.has(key))
            throw new Error(`Instance with key \`${key}\ does not exist.`);

        let instance = this._instances.get(key);
        this._instances.delete(key);

        let original_node = this.pCopyable.getOriginalNode();
        let instance_keys = this.pCopyable._instanceKeys.concat([ key ]);
        for (let i = 0; i < original_node.pChildren.length; i++)
            original_node.pChildren.get(i).pCopyable.deleteCopies(instance_keys);
        //
        // for (let i = 0; i < original_node.pChildren.length; i++) {
        //
        //     let new_child_node = original_node.pChildren.get(i).pCopyable.createCopy(
        //             true, this.pCopyable._instanceKeys.concat([ key ]));
        //     instance.pChildren.add(new_child_node);
        // }

        if (this.active)
            instance.deactivate();
    }

    getInstanceNodeCopies(source_node, key)
    {
        abTypes.argsE(arguments, Node, [ 'string', 'number' ]);

        if (!this._instances.has(key))
            return null;

        let instance = this._instances.get(key);

        let node_copies = [];
        for (let node_copy of instance._nodeCopies) {
            if (node_copy.pCopyable.sourceNode === source_node)
                node_copies.push(node_copy);
        }

        return node_copies;
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
    __onActivate()
    {
        abTypes.assert(this.parentNode !== null, 'Parent node not set.');

        for (let i = 0; i < this._instances.size; i++)
            this._instances.getAt(i).activate();
    }

    __onDeactivate()
    {
        for (let i = this._instances.size - 1; i > 0; i--)
            this._instances.getAt(i).deactivate();
    }

    __getHtmlElement()
    {
        abTypes.assert(this.parentNode !== null, 'Parent node not set.');

        return this.parentNode.htmlElement;
    }

    __getFirstHtmlElement()
    {
        return this._instances.size === 0 ?
                null : this._instances.getAt(0).firstHtmlElement;
    }
    /* / Node */

}
module.exports = RepeatNode;


Object.defineProperties(RepeatNode, {

    PChildren: { value:
    class extends Node.PChildren {

        __onAddChild(child_node, next_node)
        {
            abTypes.implementsE(child_node, Node.PCopyable);
            // abTypes.argsE(arguments, abTypes.Prop(Node.PCopyable), Node);
        }

        __getNext(child_node)
        {
            let next_node = this.findNext(child_node);
            if (next_node !== null)
                return next_node;

            return this.nextNode;
        }

    }},


    PCopyable: { value:
    class RepeatNode_PCopyable extends Node.PCopyable
    {

        __createCopy(node_instances)
        {
            return new RepeatNode();
        }

    }},

});


require('./RepeatNode.InstanceNode');
