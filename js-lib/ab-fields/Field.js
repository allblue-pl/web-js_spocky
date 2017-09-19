'use strict';

const abTypes = require('ab-types');


class Field
{

    constructor()
    {

    }

    $set(field_path, field_value)
    {
        let field = this.__getField(field_path, true);
        field.$setValue(field_value);
    }


    __getField(field_path) { abTypes.virtual(this); }

}
module.exports = Field;


Object.defineProperties(Field, {

    Children: { value:
    class Field_Children {

        get Property() { return `_children`; }

        constructor()
        {
            this.fields = new Map();
        }

        getField(field_path, create)
        {
            let field_names_array = field_path.split('.');

            let current_object_field = this;
            for (let i = 0; i < field_names_array.length; i++) {
                let field_name = field_names_array[i];

                if (!this._fields.has(field_name))
                    return undefined;

                let field = this._fields.get(field_name);

                if (i === field_names_array.length - 1)
                    return field;

                if (!abTypes.implements(field, Field.Children))
                    return undefined;
            }
        }

    }},

});
