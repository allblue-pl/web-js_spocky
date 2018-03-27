'use strict';

const 
    abNodes = require('ab-nodes'),
    js0 = require('js0')
;

class Viewable
{

    static get Property() {
        return '_$viewable';
    }


    get active() {
        return this._active;
    }


    constructor()
    {
        Object.defineProperties(this, {
            _parentNode: { value: null, writable: true, },
            _active: { value: null, writable: true, },
        });
    }

    activate(parentNode)
    {
        js0.args(arguments, abNodes.Node);

        if (!js0.type(parentNode, js0.Prop(abNodes.Node.PChildren)))
            throw new Error(`'parentNode' does not have 'PChildren' property.`);

        if (this._parentNode !== null)
            this.deactivate();

        this._parentNode = parentNode;
        this.__activate(this._parentNode);

        this._active = true;
    }

    deactivate()
    {
        if (this._parentNode !== null) {
            this.__deactivate(this._parentNode);
            this._parentNode = null;
        }

        this._active = false;
    }

    
    _setParentNode(parentNode) {
        js0.args(arguments, abNodes.Node);

        if (!js0.type(parentNode, js0.Prop(abNodes.Node.PChildren)))
            throw new Error(`'parentNode' does not have 'PChildren' property.`);

        if (this._parentNode !== null && this._active)
            this.deactivate();

        this._parentNode = parentNode;
        if (this._active)
            this.activate();
    }


    __activate(parentNode) { js0.virtual(this); }
    __deactivate(parentNode) { js0.virtual(this); }

    // activate(parentNode)
    // {
    //     js0.args(arguments, abNodes.Node);
    //     if (!js0.type(parentNode, js0.Prop(abNodes.Node.PChildren)))
    //         throw new Error(`'parentNode' does not have 'PChildren' property.`);

    //     if (!this._parentNode !== null)
    //         this.deactivate();

    //     this._parentNode = parentNode;
    //     this._parentNode.pChildren.add(this.getNode());
    // }

    // deactivate(parentNode)
    // {
    //     if (this._parentNode !== null)
    //         this._parentNode.pChildren.remove(this.getNode());
    // }

    // getNode() { throw new js0.virtual(this); }

    // static Validate(object)
    // {
    //     if (typeof object !== '[object Object]')
    //         return false;
    //     if (!('viewable' in object))
    //         return false;
    //     if (!(object.viewable instanceof Viewable))
    //         return false;
    //
    //     return true;
    // }

}
module.exports = Viewable;
