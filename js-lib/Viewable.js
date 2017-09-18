'use strict';

const abTypes = require('./ab-types');


class Viewable
{

    static get Property() {
        return '_$viewable';
    }


    constructor()
    {
        this._view = null;
    }

    getNodes() { throw new abTypes.NotImplemented(); }

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
