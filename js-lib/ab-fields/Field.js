'use strict';

const js0 = require('js0');


class Field
{

    get $value() {
        return this._rootField._$value_Get(this._fullPath);
    }
    set $value(value) {
        this._rootField._$value_Set(this._fullPath, value);
    }

    get _$rootField() {
        return this._rootField;
    }

    get _$fullPath() {
        return this._fullPath;
    }

    get _$rootPath() {
        return this._fullPath.substring(2);
    }

    get _$definitionInfos() {
        return this._definitionInfos;
    }

    get _$name() {
        return this._fullPath.substring(this._fullPath.lastIndexOf('.') + 1);
    }


    constructor()
    {
        Object.defineProperties(this, {
            _rootField: { value: null, writable: true, },
            _fullPath: { value: null, writable: true,},
            _definitionInfos: { value: null, writable: true,},

            _listeners_OnChange: { value: [], },
        });
    }

    $onChange(on_change_listener)
    {
        this._listeners_OnChange.push(on_change_listener);
    }

    __init(root_field, field_full_path, definition_infos)
    {
        this._rootField = root_field;
        this._fullPath = field_full_path;
        this._definitionInfos = definition_infos;
    }

    __onChange(value)
    {
        for (let definition_info of this._$definitionInfos) {
            if ('onChange' in definition_info)
                definition_info.onChange(value, this._$name, this._$rootPath);
        }

        for (let on_change_listener of this._listeners_OnChange)
            on_change_listener(value);
    }


    __value_OnGet() { js0.virtual(this); }
    __value_OnSet() { js0.virtual(this); }

}
module.exports = Field;
