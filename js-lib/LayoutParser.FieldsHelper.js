'use strict';

const
    abFields = require('ab-fields'),
    js0 = require('js0'),

    FieldInfo = require('./LayoutParser.FieldInfo')
;

export default class FieldsHelper
{

    static get Types() {
        return Types;
    }


    constructor()
    {
        this._fieldDefinitions = abFields.define();
        this._fieldInfos = [];

        this.regexpStrs_Expression = '\\?\\(((.|\\s|\\S)+)\\)';
        this.regexpStrs_FieldName = '([a-zA-Z][a-zA-Z0-9._]*)+?(\\((.*?)\\))?';
    }

    def(repeatInfo, fieldPath, includesPrefix, requiredFieldDefinitionClass)
    {
        js0.args(arguments, require('./LayoutParser.RepeatInfo'), 'string',
                'boolean', 'function');

        let fieldInfo = new FieldInfo(this, repeatInfo, fieldPath, includesPrefix);

        if (fieldInfo.type === FieldInfo.Types.Field) {
            fieldInfo.fieldDefinitions.push(this._define(fieldInfo, repeatInfo, 
                    requiredFieldDefinitionClass));
        } else if (fieldInfo.type === FieldInfo.Types.Function) {
            fieldInfo.fieldDefinitions.push(this._define(fieldInfo, repeatInfo, 
                    requiredFieldDefinitionClass));
        } else if (fieldInfo.type === FieldInfo.Types.Expression) {
            
        }
        
        return fieldInfo;
    }

    getType(fieldDefintion)
    {

    }

    getValue(fieldDefintion, value, keys)
    {
        let field = this.find(fieldDefintion);
        if (field === null)
            throw Error('Field not defined: ' + fieldDefintion);

        return typeof value === 'function' ? 
                eval(`value(${fieldInfo.args})`) : value;
    }

    find(fieldDefintion)
    {
        for (let field of this._fields) {
            if (field.definition === fieldDefintion)
                return field;
        }

        return null;
    }

    isFieldName(str, includesPrefix)
    {
        js0.args(arguments, 'string', 'boolean');

        if (includesPrefix) {
            if (str[0] !== '$')
                return false;

            return str.substring(1).match(
                    new RegExp('^' + this.regexpStrs_FieldName + '$')) !== null;
        }

        return str.match(new RegExp('^' + this.regexpStrs_FieldName + '$')) !== null;
    }

    isExpression(str)
    {
        js0.args(arguments, 'string', [ 'boolean', js0.Default ]);

        console.log(str, 'Test');

        return str.match(new RegExp('^' + this.regexpStrs_Expression + '$', 'm')) !== null;
    }

    isValidString(str, includesPrefix)
    {
        js0.args(arguments, 'string', 'boolean');

        return this.isFieldName(str, includesPrefix) || this.isExpression(str);
    }

    matchField(fieldPath)
    {
        js0.args(arguments, 'string');

        return fieldPath.match(this.regexpStrs_FieldName);
    }

    validateFieldName(fieldName, includesPrefix)
    {
        js0.args(arguments, 'string', 'boolean');

        if (!this.isFieldName(fieldName, includesPrefix))
            throw new Error(`'${fieldName}' is not a valid field name.`);
    }

    validateProperty(property, includesPrefix)
    {
        js0.args(arguments, 'string', 'boolean');

        if (!this.isValidString(property, includesPrefix))
            throw new Error(`'${property}' is not a valid property.`);
    }

    _add(fieldDefintion, fieldInfo)
    {
        js0.args(arguments, abFields.Definition);

        let field = this.find(fieldDefintion);

        if (field === null)
            field = new Field(fieldDefintion);
        
        this._fields.push(field);
    }

    _define(fieldInfo, repeatInfo, newFieldDefinitionClass)
    {
        let fd = this._fieldDefinitions;
        let repeatOffset = 0;

        /* Check if is list. */
        let firstPart = fieldInfo.field_Parts[0];
        let repeatFound = false;
        for (let i = repeatInfo.repeats.length - 1; i >= repeatOffset; i--) {
            if (firstPart !== repeatInfo.repeats[i].itemName)
                continue;
            repeatFound = true;

            fd = repeatInfo.repeats[i].fieldDefinition;
            if (fieldInfo.field_Parts.length === 1)
                return fd.item(newFieldDefinitionClass);
            
            fd = fd.item(abFields.ObjectDefinition);
        }

        for (let i = repeatFound ? 1 : 0; i < fieldInfo.field_Parts.length - 1; i++) {
            let part = fieldInfo.field_Parts[i];
            fd = fd.object(part);
        }

        let lastPart = fieldInfo.field_Parts[fieldInfo.field_Parts.length - 1];

        // let field = null;
        // let fieldExists = fd.exists(lastPart);

        // let fieldIsVar = fieldExists ? 
        //         (fd.get(lastPart) instanceof abFields.VarDefinition ? true : false) : 
        //         false;
        // fieldExists = false;
        // fieldIsVar = false;

        if (newFieldDefinitionClass === abFields.ObjectDefinition)
            return fd.object(lastPart, false);
        else if (newFieldDefinitionClass === abFields.ListDefinition)
            return fd.list(lastPart, false);
        else if (newFieldDefinitionClass === abFields.VarDefinition) {
            // if (fieldExists && !fieldIsVar)
            //     return fd.get(lastPart);

            return fd.var(lastPart);
        } else
           throw new Error(`Unknown 'newFieldDefinitionClass'.`);
    }

}


class Field
{

    constructor(fieldDefintion)
    {
        this.definition = fieldDefintion;
    }

}


class Types
{

    static get Var() { return 1; }
    static get Function() { return 2; }
    static get Expression() { return 3; }

}