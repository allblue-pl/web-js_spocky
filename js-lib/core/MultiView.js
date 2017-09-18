'use strict';

const Viewable = require('../Viewable');


class MultiView
{

    constructor()
    {
        abTypes.prop(this, MultiView.Viewable, this)
        Object.defineProperties(this, {
            _views: { value: [] },
        });
    }

    push(viewable)
    {
        if (!abTypes.implements(viewable, Viewable))
            throw new Error('`viewable` must implement `Viewable`.');

        this._views.push(viewable);
    }

    pop()
    {
        this._views.pop();
    }

}
module.exports = MultiView;


Object.defineProperties(MultiView, {

    Viewable: { value:
    class extends Viewable {

        constructor(multi_view)
        {
            this._multiView = multi_view;
        }

        getNodes() {
            let nodes = [];

            let views = this._multiView._views;
            for (let i = 0; i < views.length; i++) {
                let view_nodes = views[i].getNodes();
                for (let j = 0; j < view_nodes.length; j++)
                    nodes.push(view_nodes[j]);
            }

            return nodes;
        }

    }},

});
