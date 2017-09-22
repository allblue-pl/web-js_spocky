'use strict';

const ArrayField = require('./fields/ArrayField');
const ObjectField = require('./fields/ObjectField');
const RootField = require('./fields/RootField');
const VarField = require('./fields/VarField');

const FieldError = require('./FieldError');


class abFields_Class
{

    get ArrayField() {
        return ArrayField;
    }

    get ObjectField() {
        return ObjectField;
    }

    get RootField() {
        return RootField;
    }

    get VarField() {
        return VarField;
    }

    get FieldError() {
        return FieldError;
    }


    constructor()
    {

    }

    set(field_path, field_value)
    {

    }

}
module.exports = new abFields_Class();
