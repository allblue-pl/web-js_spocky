'use strict';

const abTypes = require('../ab-types');


class Node
{

    get active() {
        return this._active;
    }

    get firstHtmlElement() {
        let first_html_element = this.__getNodeFirstHtmlElement();
        return first_html_element !== null ?
                first_html_element : this.nextHtmlElement;
    }

    get htmlElement() {
        return this.__getNodeHtmlElement();
    }

    get nextHtmlElement() {
        return this.nextNode === null ? null : this.nextNode.firstHtmlElement;
    }

    get nextNode() {
        return this.parentNode.children.__getNext(this);
    }

    get parentNode() {
        return this._parentNode;
    }


    constructor()
    {
        this._active = null;

        this._listener = null;

        this._parentNode = null;
    }

    activate()
    {
        if (this.active)
            return;

        this.__onNodeActivate();
        this._active = true;
    }

    deactivate()
    {
        if (!this.active)
            return;

        this.__onNodeDeactivate();
        this._active = false;
    }


    __onNodeActivate() { abTypes.virtual(); }
    __onNodeDeactivate() { abTypes.virtual(); }

    __getNodeHtmlElement() { abTypes.virtual(); }
    __getNodeFirstHtmlElement() { abTypes.virtual(); }

}
module.exports = Node;


Object.defineProperties(Node, {

    PChildren: { value:
    class Node_PChildren {

        static get PropName() { return 'children'; }


        get length()
        {
            return this._children.length;
        }

        constructor(node)
        {
            abTypes.args(arguments, Node);

            this.__node = node;
            this._children = [];
        }

        add(child_node, next_node = null)
        {
            abTypes.args(arguments, Node, Node);

            let insert_index = next_node === null ?
                    this._children.length : this._children.indexOf(next_node);
            if (insert_index === -1)
                new Error('`next_node` does not exist in `child_node` parent.');

            child_node._parentNode = this.__node;

            this._children.splice(insert_index, 0, child_node);

            this.__onAddChild(child_node);
        }

        copy()
        {
            abTypes.implements(this.__node, Node.PCopyable);

            let top_node = this.__node.copyable.copy(false);

            let node_copies_stack = [ top_node ];
            let children_stack = [ this ];

            while(node_copies_stack.length > 0) {
                let node_copy = node_copies_stack[0];
                let children = children_stack[0];

                for (let i = 0; i < children.length; i++) {
                    abTypes.implements(children.get(i), Node.PCopyable);

                    let child_node_copy = children.get(i).copyable.copy(false);
                    node_copy.children.add(child_node_copy);

                    if (abTypes.implementsC(child_node_copy, Node.PChildren)) {
                        node_copies_stack.push(child_node_copy);
                        children_stack.push(children.get(i).children);
                    }
                }

                node_copies_stack.splice(0, 1);
                children_stack.splice(0, 1);
            }

            return top_node;
        }

        get(child_node_index)
        {
            return this._children[child_node_index];
        }

        getNext(child_node)
        {
            let child_node_index = this._children.indexOf(child_node);
            abTypes.assert(child_node_index !== -1, '`child_node` not found.');

            if (child_node_index < this._children.length - 1)
                return this._children[child_node_index + 1];

            return null;
        }


        __onAddChild() { abTypes.virtual(this); }
        __getNext() { abTypes.virtual(this); }
    }},


    PCopyable: { value:
    class Node_PCopyable {
        static get PropName() { return 'copyable'; }


        constructor(node, args)
        {
            this.__node = node;
            this.__args = args;
        }

        copy(deep_copy) { abTypes.virtual(); }
    }},

});
