'use strict';

const Field = require('../Field');


class VarField extends Field
{

    constructor()
    { super();
        this._$value = undefined;
    }

}
module.exports = VarField;
