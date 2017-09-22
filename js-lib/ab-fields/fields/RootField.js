'use strict';

const abTypes = require('ab-types');

const ObjectField = require('./ObjectField');


class RootField extends ObjectField
{

    $define(field_path, definition)
    {
        abTypes.argsE('string', abTypes.RawObject);

        this._definitions.push(new RootField.Definition(field_path, definition));
    }


    constructor()
    { super(this);
        Object.defineProperties(this, {
            _definitions: [],
            _fields: new Map(),
        });
    }

}
module.exports = RootField;


Object.defineProperties(RootField, {

    Definition: { value:
    class {

        constructor(field_path, definition_info)
        {
            let regexp_string = field_path
                .replace(/\./g, '\\.')
                .replace(/\*/g, '.*?');

            Object.defineProperties(this, {
                info: { value: definition_info, },

                _regexp: { value: new RegExp(regexp_string), },
            });
        }

        matches(field_path)
        {
            return field_path.matches(this._regexp);
        }

    }},

});
