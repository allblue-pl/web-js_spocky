'use strict';


class ObjectField extends Field
{

    constructor()
    {
        abTypes.prop(this, Field.Children);

        this._fields = new Map();
    }

    __setValue(field_name, value)
    {
        this._children.set(field_name, value);
    }

    __getField(field_path)
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
