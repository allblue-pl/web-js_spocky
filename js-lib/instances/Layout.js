'use strict';

const abNodes = require('../ab-nodes');
const abTypes = require('ab-types');
const abLayouts = require('../ab-layouts');

const Viewable = require('../Viewable');
const LayoutParser = require('../core/LayoutParser');


class Layout
{

    static Parse(layout_content)
    {
        let layout_node = Layout.Parser.parse(layout_content);
        let fields = Layout.Parser.getFields();

        return new Layout(layout_node, fields);
    }


    get fields() {
        return this._fields;
    }

    constructor(layout_node, fields)
    {
        abTypes.argsE(arguments, abLayouts.LayoutNode);
        abTypes.prop(this, Layout.Viewable, layout_node);

        this._fields = fields;
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
