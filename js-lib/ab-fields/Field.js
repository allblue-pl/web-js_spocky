'use strict';

const abTypes = require('ab-types');


class Field
{

    get $value() {
        return this.__value_Get();
    }
    set $value(value) {
        return this.__value_Set(value);
    }


    constructor(root_field, definition_info = {})
    {
        abTypes.argsE(arguments, 'string', [ abTypes.RawObject, abTypes.Default ]);

        this._rootField = root_field;
        this._definitionInfo = definition_info;
    }

    $onChange(on_change_listener)
    {
        this.__listeners_OnChange.push(on_change_listener);
    }


    __getFieldNamesArray(field_path)
    {
        let field_names_array = field_path.split('.');

        return field_names_array;
    }

    __value_Get()
    {
        return this.__value_OnGet();
    }

    __value_Set(value)
    {
        value = this.__value_OnSet(value);

        for (let on_core_change_listener of this.__listeners_OnCoreChange)
            on_core_change_listener(value);
        for (let on_change_listener of this.__listeners_OnChange)
            on_change_listener(value);
    }


    __value_OnGet() { abTypes.virtual(this); }
    __value_OnSet() { abTypes.virtual(this); }

}
module.exports = Field;
