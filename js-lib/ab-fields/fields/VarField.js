'use strict';

const Field = require('../Field');


class VarField extends Field
{

    constructor()
    { super();
        this._value = undefined;
    }


    __value_OnGet()
    {
        return this._value;
    }

    __value_OnSet(value)
    {
        this._value = value;

        if ('onChange' in this.__definitionInfo)
            this.__definitionInfo.onChange(value);

        return value;
    }

}
module.exports = VarField;
