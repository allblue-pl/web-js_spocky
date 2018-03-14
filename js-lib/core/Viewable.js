'use strict';

const js0 = require('js0');


class Viewable
{

    static get Property() {
        return '_$viewable';
    }


    constructor()
    {
        this._view = null;
    }

    getNodes() { throw new js0.NotImplemented(); }

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
