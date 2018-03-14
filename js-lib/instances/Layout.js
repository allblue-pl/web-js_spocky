'use strict';

const abNodes = require('ab-nodes');
const js0 = require('js0');
const abLayouts = require('ab-layouts');

const Viewable = require('../core/Viewable');
const LayoutParser = require('../core/LayoutParser');


class Layout
{

    static Parse(layout_content)
    {
        let layout_node = Layout.Parser.parse(layout_content);
        let fields = Layout.Parser.getFields();
        let elems = Layout.Parser.getElems();
        let nodes = Layout.Parser.getNodes();

        return new Layout(layout_node, fields, elems, nodes);
    }


    get fields() {
        return this._fields;
    }

    get elems() {
        return this._elems;
    }

    constructor(layout_node, fields, elems, nodes)
    {
        js0.args(arguments, abLayouts.LayoutNode);
        js0.prop(this, Layout.Viewable, layout_node);

        Object.defineProperties(this, {
            _fields: { value: fields, },
            _elems: { value: elems, },
            _nodes: { value: nodes, },
        });
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
