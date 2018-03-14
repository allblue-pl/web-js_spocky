'use strict';

const js0 = require('js0');

const ObjectField = require('./ObjectField');
const VarField = require('./VarField');


class RootField extends ObjectField
{

    get _$fullPath() {
        return '$';
    }

    get _$rootField() {
        return this;
    }

    get _$definitionInfos() {
        return [];
    }


    constructor()
    { super();
        Object.defineProperties(this, {
            _definitions: { value: [], },

            _rootFields: { value: new Map([[ '$', this ]]), },
        });
    }

    $define(full_field_path, definition_info)
    {
        js0.args(arguments, 'string', js0.RawObject);

        let definition = new RootField.Definition(full_field_path,
                definition_info);
        this._definitions.push(definition);

        for (let [ field_full_path, field ] of this._rootFields ) {
            if (definition.matches(field_full_path))
                field._$definitionInfos.push(definition.info);
        }
    }


    _$field_Delete(field_full_path, trigger_on_change = true)
    {
        let field = this._$field_Get(field_full_path, false);
        if (!this._$field_Exists(field_full_path))
            return;

        if (js0.var(field, ObjectField))
            this._field_Delete_ObjectItems(field_full_path);

        this._field_Delete(field_full_path, trigger_on_change);
    }

    _$field_Exists(field_full_path)
    {
        return this._$field_Get(field_full_path, false) !== null;
    }

    _$field_Get(field_full_path, create_intermediate_fields, is_object = false)
    {
        let field_names_array = this._getFieldNamesArray(field_full_path);

        if (this._rootFields.has(field_full_path))
            return this._rootFields.get(field_full_path);

        let current_field_full_path = '$';
        let parent_field = this;
        for (let i = 1; i < field_names_array.length; i++) {
            let field_name = field_names_array[i];
            let final = i === field_names_array.length - 1;
            current_field_full_path = `${current_field_full_path}.${field_name}`;

            let field = null;
            if (this._rootFields.has(current_field_full_path)) {
                field = this._rootFields.get(current_field_full_path);
            } else {
                if (create_intermediate_fields) {
                    field = this._field_Create(parent_field, current_field_full_path,
                            field_name, is_object || !final);
                    if (!final || is_object)
                        field.__onChange(field);
                } else
                    return null;
            }

            if (final)
                return field;

            if (!(field instanceof ObjectField))
                return null;

            parent_field = field;
        }
    }

    // _$field_Set(field_full_path, field_value)
    // {
    //     let field = this._$field_Get(field_full_path, true);
    //
    //     return field;
    // }

    _$value_Get(field_full_path)
    {
        let field = this._$field_Get(field_full_path, false);

        if (field === null)
            return undefined;
        else if (field instanceof VarField)
            return field._$value;
        else if (field instanceof ObjectField)
            return field;
    }

    _$value_Set(field_full_path, field_value)
    {
        let field_value_is_object = this._value_IsObject(field_value);
        if (field_value_is_object)
            field_value = this._value_ToObject(field_value);

        if (field_value_is_object) {
            if (field_value.size > 0) {
                this._value_Set_FromObject(field_full_path, field_value);
                return;
            }
        }

        let field = this._$field_Get(field_full_path, true, field_value_is_object);
        if ((js0.var(field, VarField) && field_value_is_object) ||
                (js0.var(field, ObjectField) && !field_value_is_object)) {
            this._$field_Delete(field_full_path, false);
            field = this._$field_Get(field_full_path, true, field_value_is_object);
        }

        /* Set value from object. */
        if (!field_value_is_object)
            field._$value = field_value;
        field.__onChange(field_value);
    }

    _getFieldNamesArray(field_path)
    {
        let field_names_array = field_path.split('.');

        return field_names_array;
    }

    _field_Create(parent_field, field_full_path, field_name, is_object)
    {
        let field = is_object ? new ObjectField() : new VarField();

        let definition_infos = [];
        for (let definition of this._definitions) {
            if (definition.matches(field_full_path))
                definition_infos.push(definition.info);
        }

        field.__init(this, field_full_path, definition_infos);
        this._rootFields.set(field_full_path, field);

        parent_field.__onSet(field_name, is_object ? field : undefined);

        return field;
    }

    _field_Delete(field_full_path, trigger_on_change)
    {
        let field_names_array = this._getFieldNamesArray(field_full_path);
        let field_name = field_names_array.pop();
        let parent_field = this._$field_Get(field_names_array.join('.'));
        let field = this._$field_Get(field_full_path);

        if (parent_field !== null)
            parent_field.__onDelete(field_name);

        this._rootFields.delete(field_full_path);
        if (trigger_on_change)
            field.__onChange(undefined);
    }

    _field_Delete_ObjectItems(field_full_path)
    {
        let escaped_field_full_path = field_full_path.replace(/\$/g, '\\$');

        let regexp = new RegExp(`^${escaped_field_full_path}\\..*$`);
        for (let root_field_full_path of this._rootFields.keys()) {
            if (root_field_full_path.match(regexp))
                this._field_Delete(root_field_full_path, true);
        }
    }

    _value_IsObject(value)
    {
        return js0.var(value, [ js0.RawObject, Array, Map, Set ]);
    }

    _value_Set_FromObject(field_full_path, field_object)
    {
        let field_values = new Map();

        let field_object_infos = [{
            fullPath: field_full_path,
            value: field_object,
        }];
        while (field_object_infos.length > 0) {
            let current_field_info = field_object_infos.shift();

            for (let [ item_field_name, item_field_value ] of
                        current_field_info.value) {
                let item_field_full_path = `${current_field_info.fullPath}` +
                        `.${item_field_name}`;

                if (this._value_IsObject(item_field_value)) {
                    item_field_value = this._value_ToObject(item_field_value);

                    if (item_field_value.size === 0)
                        field_values.set(item_field_full_path, new Map());
                    else {
                        field_object_infos.push({
                            fullPath: item_field_full_path,
                            value: item_field_value,
                        });
                    }
                } else
                    field_values.set(item_field_full_path, item_field_value);
            }
        }

        for (let [ new_field_full_path, new_field_value ] of field_values)
            this._$value_Set(new_field_full_path, new_field_value);
    }

    _value_ToObject(value)
    {
        if (js0.var(value, Map))
            return value;
        else if (js0.var(value, js0.RawObject)) {
            let map = new Map();
            Object.keys(value).forEach(key => {
                map.set(key, value[key]);
            });
            return map;
        } else if (js0.var(value, Array)) {
            let map = new Map();
            value.map((value, index) => {
                map.set(index, value);
            });
            return map;
        }
    }

}
module.exports = RootField;


Object.defineProperties(RootField, {

    Definition: { value:
    class {

        constructor(field_path, definition_info)
        {
            let regexp_string = '^\\$\\.' + field_path
                .replace(/\./g, '\\.')
                .replace(/\*/g, '[a-zA-Z0-9\_]*?') + '$';

            Object.defineProperties(this, {
                info: { value: definition_info, },

                _regexp: { value: new RegExp(regexp_string), },
            });
        }

        matches(field_path)
        {
            return field_path.match(this._regexp) !== null;
        }

    }},

});
