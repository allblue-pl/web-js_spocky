'use strict';

const abTypes = require('ab-types');

const Field = require('../Field');
const FieldError = require('../FieldError');

const VarField = require('./VarField');


class ObjectField extends Field
{

    constructor(root_field)
    { super(root_field);
        Object.defineProperties(this, {
            _fields: { value: new Map(), },
            _values: { value: {}, },
        });
    }

    $get(field_path)
    {
        abTypes.argsE(arguments, 'string');

        let field = this.__field_Get(this._getFieldNamesArray(field_path), false);

        return field.value;
    }

    $set(field_path, field_value)
    {
        abTypes.argsE(arguments, 'string', null, [ 'function', abTypes.Default ]);

        let field = this.__field_Get(this.__getFieldNamesArray(field_path), true);
        if (on_core_change_listener !== null)
           field.__listeners_OnCoreChange.push(on_core_change_listener);
        field.__value_Set(field_value);

        return field;
    }

    $setField(field_path, field)
    {
        let field_names_array = this.__getFieldNamesArray(field_path);

        let parent_field = this.__field_Get(field_names_array, {});

    }


    __field_Get(field_names_array, create)
    {
        let object_field = this;
        for (let i = 0; i < field_names_array.length; i++) {
            let field_name = field_names_array[i];
            let final = i === field_names_array.length - 1;

            let field = null;
            if (!this._fields.has(field_name)) {
                if (create) {
                    if (final) {
                        field = new VarField();
                        object_field.__field_Set(field_name, field);
                    } else {
                        field = new ObjectField();
                        object_field.__field_Set(field_name, field);
                    }
                } else
                    return null;
            } else
                field = this._fields.get(field_name);

            if (final)
                return field;

            if (!(field instanceof ObjectField))
                return null;

            object_field = field;
        }
    }

    __field_Set(field_name, field)
    {
        this._fields.set(field_name, field);
        field._fullPath = `${this._fullPath}.${field_name}`;

        Object.defineProperty(this, field_name, {
            get: () => {
                return field.$value;
            },
            set: (value) => {
                field.$value = value;
            },
            enumerable: true,
        });
    }

    __value_Get()
    {
        return this;
    }

    __value_OnSet(value)
    {
        if (value !== null) {
            if (Object.getPrototypeOf(value) !== Object.prototype ||
                    !(value instanceof Map)) {
                throw new FieldError(`\`ObjectField\` value must be \`null\`` +
                        ` or an \`object\`.`)
            }
        }


    }

}
module.exports = ObjectField;
