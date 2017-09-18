'use strict';

const abNodes = require('../ab-nodes');
const abTypes = require('../ab-types');
const abLayouts = require('../ab-layouts');

const Viewable = require('../Viewable');
const LayoutParser = require('../core/LayoutParser');


class Layout
{

    static Parse(layout_content)
    {
        return new Layout(Layout.Parser.parse(layout_content));
    }


    constructor(layout_node)
    {
        abTypes.args(arguments, abLayouts.LayoutNode);
        abTypes.prop(this, Layout.Viewable, layout_node);
    }

}
module.exports = Layout;


Object.defineProperties(Layout, {

    Parser: { value: new LayoutParser() },

    Viewable: { value:
    class extends Viewable {

        constructor(layout_node)
        { super();
            this._nodes = [ layout_node ];
        }

        getNodes()
        {
            return this._nodes;
        }

    }},

});
