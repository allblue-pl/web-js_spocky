'use strict';

const
    abLayouts = require('ab-layouts'),
    js0 = require('js0'),

    Layout = require('./Layout'),
    Module = require('./Module')
;

class Holder
{

    set $view(value) {
        if (!js0.type(value, [ require('./Layout'), require('./Module'), js0.Null ]))
            throw new Error(`'$view' must be 'Layout', 'Module' or 'Null'.`);

        if (this._$view === null)
            return;

        if (this._view !== null)
            this._view._$viewable.deactivate();

        this._view = value;
        if (this._view !== null)
            this._view._$viewable.activate(this._layoutNode);
    }


    constructor(layoutNode)
    {
        js0.args(arguments, abLayouts.LayoutNode);

        Object.defineProperties(this, {
            _layoutNode: { value: layoutNode, },
            _view: { value: null, writable: true, },
        });
    }

    // _$activate()
    // {
    //     if (this._view !== null)
    //         this._view._$viewable.activate(this._layoutNode);
    // }

}
module.exports = Holder;