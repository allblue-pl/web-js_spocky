'use strict';

const 
    abLayouts = require('ab-layouts'),
    js0 = require('js0'),

    LayoutParser = require('./LayoutParser'),
    Viewable = require('./Viewable')
;

class Layout
{

    Replace(layoutContent, replaceFrom, replaceTo)
    {
        for (let index in layoutContent) {
            if (js0.type(nodeContent[index], 'string')) {
                nodeContent[index] === layoutContent[index]
                        .replace(new RegExp(replaceFrom, 'g'), replaceTo);
            } else if (js0.type(nodeContent[index], js0.RawObject)) {
                for (let objectKey in nodeContent[index]) {
                    if (typeof nodeContent[index][objectKey] === 'string') {
                        nodeContent[index][objectKey] === layoutContent[index][objectKey]
                                .replace(new RegExp(replaceFrom, 'g'), replaceTo);
                    }
                }
            } else if (js0.type(nodeContent[index], Array)) {
                Layout.Replace(nodeContent[index], replaceFrom, replaceTo);
            }
        }
    }


    constructor(layoutContent)
    {
        js0.args(arguments, Array);
        js0.prop(this, Layout.Viewable, this);

        let layoutParser = Layout.Parser;
        let layoutNode = layoutParser.parse(layoutContent);

        Object.defineProperties(this, {
            $elems: { value: layoutParser.elems, },
            $fields: { value: layoutParser.fields, },
            $holders: { value: layoutParser.holders, },

            _layoutNode: { value: layoutNode, },
        });
    }

    _parse(layoutContent)
    {
        
    }

}
module.exports = Layout;


Object.defineProperties(Layout, {

    Parser: { value: new LayoutParser() },

    Viewable: { value:
    class Layout_Viewable extends Viewable {

        constructor(layout)
        { super();
            this._layout = layout;
        }

        __activate(parentNode)
        {
            parentNode.pChildren.add(this._layout._layoutNode);
            // console.log('Adding child:', this._layout._layoutNode, 'to', parentNode);
            // this._layout._layoutNode.activate();
        }

        __deactivate(parentNode)
        {
            parentNode.pChildren.remove(this._layout._layoutNode);
            // this._layout._layoutNode.deactivate();
        }

    }},

});
