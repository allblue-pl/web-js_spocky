'use strict';

const
    js0 = require('js0'),

    FieldInfo = require('./LayoutParser.FieldInfo')
;

export default class RepeatInfo
{

    constructor(elementsStack)
    {
        this.repeats = [];
        this.virtual = false;

        for (let i = 0; i < elementsStack.length; i++) {
            let element = elementsStack[i];

            if ('repeat' in element.info) {
                this.repeats.push(element.info.repeat);
                this.virtual = true;
            }
        }
    }

    // getKeys(fieldInfo, keys)
    // {
    //     let repeatKeys = [];
    //     for (let i = 0; i < this.repeats.length; i++)
    //         repeatKeys.push(null);

    //     let rawFieldParts = fieldInfo.getRawParts(this);
    //     let fullFieldPath = rawFieldParts.join('.');
    //     let keysIndex = keys.length - 1;
        
    //     for (let i = this.repeats.length - 1; i >= 0; i--) {
    //         let repeatFieldPath = this.repeats[i].fieldInfo
    //                 .getFullPath(this);
    //         if (fullFieldPath.indexOf(repeatFieldPath) === 0) {
    //             repeatKeys[i] = keys[keysIndex];
    //             keysIndex--;
    //             if (keysIndex < 0)
    //                 break;
    //             // fullFieldPath = fullFieldPath.substring(repeatFieldPath.length);
    //             // if (fullFieldPath[0] === '.')
    //             //     fullFieldPath = fullFieldPath.substring(1);
    //         }
    //     }
        
    //     return repeatKeys;
    // }

    getKeys(fieldInfos, keys)
    {
        let repeatKeys = [];
        for (let i = 0; i < this.repeats.length; i++)
            repeatKeys.push(null);

        if (keys.length === 0)
            return repeatKeys;

        let keysIndex = keys.length - 1;
        
        for (let i = this.repeats.length - 1; i >= 0; i--) {
            for (let fieldInfo of fieldInfos) {
                let rawFieldParts = fieldInfo.getRawParts(this);
                let fullFieldPath = rawFieldParts.join('.');
                
                let repeatFieldPath = this.repeats[i].fieldInfo
                        .getFullPath(this);
                if (fullFieldPath.indexOf(repeatFieldPath) === 0) {
                    repeatKeys[i] = keys[keysIndex];
                    keysIndex--;
                    if (keysIndex < 0)
                        break;
                    // fullFieldPath = fullFieldPath.substring(repeatFieldPath.length);
                    // if (fullFieldPath[0] === '.')
                    //     fullFieldPath = fullFieldPath.substring(1);
                }
            }

            if (keysIndex < 0)
                break;
        }
        
        return repeatKeys;
    }

}