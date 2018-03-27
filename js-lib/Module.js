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

    set $view(value) {
        if (!js0.type(value, [ Layout, Module, js0.Null ]))
            throw new Error(`'$view' must be 'Layout', 'Module' or 'Null'.`);

        if (this._view !== null)
            this._view._$viewable.deactivate();

        this._view = value;
        if (this._parentNode !== null)
            this._view._$viewable.activate(this._parentNode);
    }


    constructor()
    {
        js0.prop(this, Module.Viewable, this);

        Object.defineProperties(this, {
            _view: { value: null, writable: true, },
            _parentNode: { value: null, writable: true, },
        });
    }

}
module.exports = Module;


Object.defineProperties(Module, {

    Viewable: { value:
    class Module_Viewable extends Viewable {

        constructor(module)
        { super()
            js0.args(arguments, Module);

            this._module = module;
        }

        __activate(parentNode)
        {
            this._module._parentNode = parentNode;

            if (this._module._view === null)
                return;
            else if (js0.type(this._module._view, js0.Prop(Viewable)))
                this._module._view._$viewable.activate(parentNode);
            else
                js0.assert(`Unknown view type.`);
        }

        __deactivate(parentNode)
        {
            if (this._module._view === null)
                return;
            else if (js.type(this._view, js0.Prop(Viewable)))
                this._module._view._$viewable.deactivate();
            else
                js0.assert(`Unknown view type.`);

            this._module._parentNode = null;
        }

    }},

});