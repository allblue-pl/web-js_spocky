'use strict';

const 
    abLayouts = require('ab-layouts'),
    js0 = require('js0'),
    test = require('test'),

    Viewable = require('./Viewable')
;


class Layout
{

    constructor(layoutContent)
    {
        js0.args(arguments, Array);
        js0.prop(this, Layout.Viewable, this);

        let layoutParser = Layout.Parser;
        let layoutNode = layoutParser.parse(layoutContent);

        Object.defineProperties(this, {
            fields: { value: layoutParser.getFields(), },

            _layoutNode: { value: layoutNode, },
        });
    }

}
module.exports = Layout;


Object.defineProperties(Layout, {

    Parser: { value: new test.LayoutParser() },

    Viewable: { value:
    class Layout_Viewable extends Viewable {

        constructor(layout)
        { super();
            this._layout = layout;
        }

        __activate(parentNode)
        {
            parentNode.pChildren.add(this._layout._layoutNode);
            this._layout._layoutNode.activate();
        }

        __deactivate(parentNode)
        {
            this._layout._layoutNode.deactivate();
        }

    }},

});
