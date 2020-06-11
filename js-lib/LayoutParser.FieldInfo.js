'use strict';

const
    abFields = require('ab-fields'),
    js0 = require('js0')
;

export default class FieldInfo
{

    static get Types() {
        return Types;
    }


    constructor(fieldsHelper, repeatInfo, fieldPath, includesPrefix)
    {
        js0.args(arguments, require('./LayoutParser.FieldsHelper'), 
                require('./LayoutParser.RepeatInfo'), 
                'string', 'boolean');

        this.fieldsHelper = fieldsHelper;
        this.repeatInfo = repeatInfo;

        this.fieldDefinitions = [];

        this.repeatInfo = this.repeatInfo;

        this.type = null;
        /* Field */
        this.field_Path = null;
        this.field_Parts = null;
        this.field_Name = null;
        /* Field Fn */
        this.fieldFn_ArgFields = null;
        this.fieldFn_ArgFieldsStr = null;
        /* Expr */
        this.expr = null;
        this.expr_ArgFields = null;

        if (this.fieldsHelper.isExpression(fieldPath)) {
            this.type = Types.Expression;

            this.expr = fieldPath.substr(2, fieldPath.length - 3);
            this.expr_ArgFields = [];
            let re = new RegExp('\\$' + this.fieldsHelper.regexpStrs_FieldName, 'g');
            let matches = this.expr.matchAll(re);
            for (let match of matches) {
                let expr_ArgFieldInfo = this.fieldsHelper.def(repeatInfo, match[1], 
                        false, abFields.VarDefinition);

                this.expr_ArgFields.push({
                    path: match[1],
                    fieldInfo: expr_ArgFieldInfo,
                });
                
                for (let expr_ArgFieldInfo_FD of expr_ArgFieldInfo.fieldDefinitions)
                    this.fieldDefinitions.push(expr_ArgFieldInfo_FD);
            }
        } else if (this.fieldsHelper.isFieldName(fieldPath, includesPrefix)) {
            if (includesPrefix)
                fieldPath = fieldPath.substr(1);

            let fieldMatch = this.fieldsHelper.matchField(fieldPath);
            if (typeof fieldMatch[3] === 'undefined') {
                this.type = Types.Field;
            } else {
                this.type = Types.Function;

                this.fieldFn_ArgFields = [];
                this.fieldFn_ArgStrs = fieldMatch[3].split(',');
                for (let argStr of this.fieldFn_ArgStrs) {
                    let re = new RegExp('\\$' + this.fieldsHelper.regexpStrs_FieldName, 'g');
                    let matches = argStr.matchAll(re);
                    for (let match of matches) {
                        let fieldFn_ArgFieldInfo = this.fieldsHelper.def(repeatInfo, match[1], 
                                false, abFields.VarDefinition);
        
                        this.fieldFn_ArgFields.push({
                            path: match[1],
                            fieldInfo: fieldFn_ArgFieldInfo,
                        });

                        for (let fieldFn_ArgFieldInfo_FD of fieldFn_ArgFieldInfo.fieldDefinitions)
                            this.fieldDefinitions.push(fieldFn_ArgFieldInfo_FD);
                    }
                }
            }

            this.path = fieldMatch[1];
            this.parts = this.path.split('.');
            this.name = this.parts[this.parts.length - 1];
        } else
            throw new Error(`Unknown 'FieldInfo' type of: ` + fieldPath);
    }

    getEval($evalStr, $argFields, $fields, $keys)
    {
        return eval($evalStr);
    }

    getEvalStr(evalStr, argFields, fields, keys)
    {
        for (let argIndex = 0; argIndex < argFields.length; argIndex++) {
            let value = `$argFields[${argIndex}].fieldInfo.getValue($fields, $keys)`;
            evalStr = evalStr.replace(new RegExp('\\$' + argFields[argIndex].path + '([^a-zA-Z0-9]|$)', 'g'), 
                    value + '$1');
        }

        return evalStr.replace(/([^a-zA-Z0-9]|^)this([^a-zA-Z0-9]|$)/g, '$1undefined$2');
    }
    
    getValue(fields, keys, valueType)
    {
        if (this.type === Types.Field) {
            let field = this.getField(fields, keys);
            if (field === null)
                return undefined;

            return field.$value;
        } else if (this.type === Types.Function) {
            let field = this.getField(fields, keys);
            if (field === null)
                return undefined;
                
            let fnVal = field.$value;
            let argsArr = [];
            for (let argStr of this.fieldFn_ArgStrs) {
                let evalStr = this.getEvalStr(argStr, this.fieldFn_ArgFields, 
                        fields, keys);
                try {
                    argsArr.push(this.getEval(evalStr));
                } catch (err) {
                    throw new Error(`Error evaluating function '$${this.path}:${evalStr_Original}': ` +  
                            err);
                }            
                
            }

            return fnVal.apply(null, argsArr);
            // let evalStr_Original = `(${fnVal})(${this.fieldFn_ArgFieldsStr})`;
            // let evalStr = this.getEvalStr(this.fieldFn_ArgFieldsStr,
            //         this.fieldFn_ArgFields, fields, keys);
            // evalStr = `(${fnVal})(${evalStr})`;

            // try {
            //     return this.getEval(evalStr);
            // } catch (err) {
            //     throw new Error(`Error evaluating function '$${this.path}:${evalStr_Original}': ` +  
            //             err);
            // }    
        } else if (this.type === Types.Expression) {
            let evalStr = this.getEvalStr(this.expr, this.expr_ArgFields, fields, keys);
            
            try {
                return this.getEval(evalStr, this.expr_ArgFields, fields, keys);
            } catch (err) {
                throw new Error(`Error evaluating expression "${this.expr}": ` + err);
            }
        } else
            throw new Error(`Unknown 'FieldInfo' type.`);
    }

    getField(fields, keys)
    {
        js0.args(arguments, [ abFields.ObjectField, js0.Null], Array);

        let rawParts = this.getRawParts(this.repeatInfo);
        // keys = repeatInfo.getKeys(this, keys);

        let keysOffset = 0;
        let field = fields;
        let fieldPath = '';
        let repeatsOffset = 0;
        for (let part of rawParts) {
            if (field instanceof abFields.ObjectField) {
                field = field.$get(part);
                fieldPath += (fieldPath !== '' ? '.' : '') + part;
            }

            while (field instanceof abFields.ListField) {
                let repeatFound = false;
                for (let i = repeatsOffset; i < this.repeatInfo.repeats.length; i++) {
                    if (fieldPath === this.repeatInfo.repeats[i].fieldInfo.getFullPath(
                            this.repeatInfo)) {
                        if (keys[i] === null || typeof keys[i] === 'undefined')
                            throw new Error('Instance keys to lists inconsistency.');

                        field = field.$get(keys[i]);
                        repeatsOffset = i + 1;
                        repeatFound = true;
                        break;
                    }
                }

                if (!repeatFound)
                    break;
                    // throw new Error('Instance keys to lists inconsistency.');
            }
        }

        return field;
    }

    getFullPath(repeatInfo)
    {
        let rawParts = this.getRawParts(repeatInfo);
        return rawParts.join('.');
    }

    getRawParts(repeatInfo)
    {
        let rawParts = this.parts.slice();

        /* Get all raw parts. */
        for (let i = repeatInfo.repeats.length - 1; i >= 0; i--) {
            if (rawParts[0] !== repeatInfo.repeats[i].itemName)
                continue;

            rawParts.splice(0, 1);
            rawParts = repeatInfo.repeats[i].fieldInfo.parts.concat(rawParts);
            // rawParts.splice(0, 0, repeatInfo.repeats[i].fieldInfo.parts);
        }

        return rawParts;
    }

}


class Types
{

    static get Field()      { return 1; }
    static get Function()   { return 2; }
    static get Expression() { return 3; }

}

class ValueTypes
{

    static get Bool()       { return 1; }
    static get Function()   { return 2; }
    static get List()       { return 3; }
    static get Object()     { return 4; }
    static get Text()       { return 5; }

}