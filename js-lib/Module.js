'use strict';

const
    abLayouts = require('ab-layouts'),
    abNodes = require('ab-nodes'),
    js0 = require('js0'),

    Layout = require('./Layout'),
    Viewable = require('./Viewable')
;

class Module
{

    get $name() {
        return this.constructor.name;
    }

    set $view(value) {
        if (!js0.type(value, [ require('./Layout'), require('./Module'), js0.Null ]))
            throw new Error(`'$view' must be 'Layout', 'Module' or 'Null'.`);

        if (this._$view !== null)
            this._$view._$viewable.deactivate();

        this._$view = value;
        if (this._$view !== null && this._$parentNode !== null)
            this._$view._$viewable.activate(this._$parentNode);
    }


    constructor()
    {
        js0.prop(this, Module.Viewable, this);

        Object.defineProperties(this, {
            _$view: { value: null, writable: true, },
            _$parentNode: { value: null, writable: true, },

            _$listeners: { value: {
                onActivate: [],
                onDeactivate: [],
            }},
        });
    }

    $onActivate(listener)
    {
        this._$listeners.onActivate.push(listener);
    }

    $onDeactivate(listener)
    {
        this._$listeners.onDeactivate.push(listener);
    }

}
module.exports = Module;


Object.defineProperties(Module, {

    Viewable: { value:
    class Module_$viewable extends Viewable {

        constructor(module)
        { super()
            js0.args(arguments, Module);

            this._module = module;
            this._onDisplay = (displayed) => {
                for (let listener of this._module._$listeners.onDisplay)
                    listener(displayed);
            };
        }

        __activate(parentNode)
        {
            this._module._$parentNode = parentNode;
            // console.log(parentNode, 'Added listener.');

            if (this._module._$view === null) {
                // Do nothing.
            } else if (js0.type(this._module._$view, js0.Prop(Viewable)))
                this._module._$view._$viewable.activate(parentNode);
            else
                js0.assert(`Unknown view type.`);

            for (let listener of this._module._$listeners.onActivate)
                listener();
        }

        __deactivate(parentNode)
        {
            for (let listener of this._module._$listeners.onDeactivate)
                listener();

            if (this._module._$view === null)
                return;
            else if (js0.type(this._module._$view, js0.Prop(Viewable)))
                this._module._$view._$viewable.deactivate();
            else
                js0.assert(`Unknown view type.`);

            this._module._$parentNode = null;
        }

    }},

});