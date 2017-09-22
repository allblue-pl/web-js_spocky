'use strict';

const ObjectField = require('./ObjectField');
const FieldError = require('../FieldError');


class ArrayField extends ObjectField
{

    constructor()
    { super();

    }

    __setValue(field_name, value)
    {
        if (Number.isInteger(field_name))
            throw new FieldError(`Array field name must be an 'integer'.`);
        if (field_name < 0 || field_name >= this.length) {
            throw new FieldError(`\`ArrayField\`s field name must be between 0 and ` +
                    `\`ArrayField\`s length.`);
        }

        this._children.set(field_name, value);
    }

}
module.exports = ArrayField;
