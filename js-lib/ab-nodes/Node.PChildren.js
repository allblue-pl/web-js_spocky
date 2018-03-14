'use strict';

const Node = require('./Node')

const abTypes = require('ab-types');


Object.defineProperty(Node, 'PChildren', { value:
class Node_PChildren {

    static get Property() { return 'pChildren'; }


    get length()
    {
        return this._children.length;
    }

    constructor()
    {
        abTypes.argsE(arguments);

        this._children = [];
    }

    add(child_node, next_node = null)
    {
        abTypes.argsE(arguments, Node, [ Node, abTypes.Default ]);

        let insert_index = next_node === null ?
                this._children.length : this._children.indexOf(next_node);
        if (insert_index === -1)
            new Error('`next_node` does not exist in `child_node` parent.');

        child_node._parentNode = this.__main;

        this._children.splice(insert_index, 0, child_node);

        this.__onAddChild(child_node);
    }

    createCopy(top_node_copy, instance_keys)
    {
        abTypes.argsE(arguments, Node, Array);
        abTypes.implementsE(this.__main, Node.PCopyable);

        let node_copies_stack = [ top_node_copy ];

        while(node_copies_stack.length > 0) {
            let node_copy = node_copies_stack.pop();
            let children = node_copy.pCopyable.getOriginalNode().pChildren;

            for (let i = 0; i < children.length; i++) {
                let child_node_copy = children.get(i).pCopyable
                        .createCopy(instance_keys, false);
                node_copy.pChildren.add(child_node_copy);

                if (!abTypes.implements(child_node_copy, Node.PChildren))
                    continue;

                // /* Copy only first repeat node. */
                // console.log('Test', node_copy === top_node);
                if (abTypes.var(child_node_copy, require('./nodes/RepeatNode')))
                    continue;

                node_copies_stack.push(child_node_copy);
            }
        }
    }

    deleteCopies(top_original_node, instance_keys)
    {
        abTypes.argsE(arguments, Node, Array);

        console.log(top_original_node.pChildren);
        let original_nodes_stack = [ top_original_node ];

        while(original_nodes_stack.length > 0) {
            let original_node = original_nodes_stack.pop();
            let children = original_node.pChildren;
            console.log(children);

            for (let i = 0; i < children.length; i++) {
                let child_node = children.get(i);

                child_node.pCopyable.deleteCopies(instance_keys, false);

                if (!abTypes.implements(child_node, Node.PChildren))
                    continue;

                original_nodes_stack.push(child_node);
            }

            // node_copies_stack.shift();
            // children_stack.shift();
        }

        return top_original_node;
    }

    findNext(child_node)
    {
        let child_node_index = this._children.indexOf(child_node);
        abTypes.assert(child_node_index !== -1, '`child_node` not found.');

        if (child_node_index < this._children.length - 1)
            return this._children[child_node_index + 1];

        return null;
    }

    get(child_node_index)
    {
        return this._children[child_node_index];
    }

    __getNext(child_node)
    {
        return this.findNext(child_node);
    }

    __onAddChild() { abTypes.virtual(this); }

}});
module.exports = Node.PChildren;
