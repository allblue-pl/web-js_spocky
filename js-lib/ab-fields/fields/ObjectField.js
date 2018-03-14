'use strict';

const abTypes = require('ab-types');

const Field = require('../Field');
const FieldError = require('../FieldError');

const VarField = require('./VarField');


class ObjectField extends Field
{

    get $length() {
        return this._fieldFullPaths.size;
    }


    constructor()
    { super();
        // Object.defineProperty(this, Symbol.iterator, {
        //     value: () => {
        //         console.log(arguments, 'Hm?');
        //         return new ObjectField.Iterator(this);
        //     },
        // });
        Object.defineProperties(this, {
            _fieldFullPaths: { value: new abTypes.List(), },
        });
    }

    [Symbol.iterator]() {
        return new ObjectField.Iterator(this);
    }

    $delete(field_path)
    {
        this._$rootField._$field_Delete(`${this._$fullPath}.${field_path}`);
    }

    $exists(field_path)
    {
        return this._$rootField._$field_Exists(`${this._$fullPath}.${field_path}`);
    }

    $get(field_path)
    {
        field_path = String(field_path);

        return this._$rootField._$value_Get(`${this._$fullPath}.${field_path}`);
    }

    $pop()
    {
        let field_full_path = this._fieldFullPaths
                .getAt(this._fieldFullPaths.size - 1);
        this._$rootField._$field_Delete(field_full_path);
    }

    $push(value)
    {
        let key = this.$length;
        while (this._fieldFullPaths.has(String(key)))
            key++;

        this.$set(key, value);
    }

    $set(field_path, field_value)
    {
        abTypes.argsE(arguments, [ 'string', 'number' ], null);

        this._$rootField._$value_Set(`${this._$fullPath}.${field_path}`, field_value);

        return this._$rootField._$field_Get(`${this._$fullPath}.${field_path}`, false);
    }

    $values()
    {

    }


    __onSet(field_name, field_value)
    { let self = this;
        let field_full_path = `${this._$fullPath}.${field_name}`;

        this._fieldFullPaths.set(field_name, field_full_path);

        Object.defineProperty(this, field_name, {
            get: () => {
                return this._$rootField._$value_Get(field_full_path);
            },
            set: (value) => {
                return this._$rootField._$value_Set(field_full_path, value);
            },
            enumerable: true,
            configurable: true,
        });

        for (let definition_info of this._$definitionInfos) {
            if ('onSet' in definition_info)
                definition_info.onSet(field_name, field_value, this._$rootPath);
        }
    }

    __onDelete(field_name)
    {
        let field_full_path = `${this._$fullPath}.${field_name}`;

        delete this[field_name];

        this._fieldFullPaths.delete(field_name);

        for (let definition_info of this._$definitionInfos) {
            if ('onDelete' in definition_info)
                definition_info.onDelete(field_name, this._$rootPath);
        }
    }

}
module.exports = ObjectField;


Object.defineProperties(ObjectField, {

    Iterator: { value:
    class {

        constructor(object_field)
        {
            this._rootField = object_field._$rootField;
            this._iterator = object_field._fieldFullPaths[Symbol.iterator]();
        }

        next()
        {
            let next_info = this._iterator.next();
            if (next_info.done)
                return { value: undefined, done: true, };

            let [ field_name, field_full_path ] = next_info.value;

            return {
                value: [ field_name, this._rootField._$value_Get(field_full_path) ],
                done: false,
            };
        }

    }},

});
