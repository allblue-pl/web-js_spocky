'use strict';

const 
    abLayouts = require('ab-layouts'),
    js0 = require('js0'),

    LayoutParser = require('./LayoutParser'),
    Viewable = require('./Viewable')
;

class Layout
{

    static Replace(layoutContent, replaceFrom, replaceTo)
    {
        js0.args(arguments, Array, 'string', 'string');

        Layout._Replace_ReplaceInArray(layoutContent, replaceFrom, replaceTo);

        // for (let index in layoutContent) {
        //     if (js0.type(layoutContent[index], js0.RawObject)) {
        //         for (let objectKey in layoutContent[index]) {                    
        //             if (js0.type(layoutContent[index][objectKey], Array)) {
        //                 Layout._Replace_ReplaceInArray(layoutContent[index][objectKey], 
        //                         replaceFrom, replaceTo);
        //             }
        //         }
        //     } else if (js0.type(layoutContent[index], Array))
        //         Layout.Replace(layoutContent[index], replaceFrom, replaceTo);
        // }
    }

    static _Replace_ReplaceInArray(array, replaceFrom, replaceTo)
    {
        for (let i = 0; i < array.length; i++) {
            if (typeof array[i] === 'string') {     
                
                let newString = array[i].replace(new RegExp(replaceFrom, 'g'), replaceTo);
                let newStringArr = Layout._Replace_ParseFields(newString);

                if (replaceFrom === '{{fullFieldName}}')     
                    console.log('Replacing: ', array[i], newString);
            
                array.splice(i, 1);
                for (let j = 0; j < newStringArr.length; j++)
                    array.splice(i + j, 0, newStringArr[j]);

                i += newStringArr.length - 1;
            } else if (js0.type(array[i], Array))
                Layout._Replace_ReplaceInArray(array[i], replaceFrom, replaceTo);
            else if (js0.type(array[i], js0.RawObject))
                Layout._Replace_ReplaceInObject(array[i], replaceFrom, replaceTo);
        }
    }

    static _Replace_ReplaceInObject(object, replaceFrom, replaceTo)
    {
        for (let key in object) {
            if (js0.type(object[key], 'string'))
                object[key] = object[key].replace(new RegExp(replaceFrom, 'g'), replaceTo);
            else if (js0.type(object[key], Array))
                Layout._Replace_ReplaceInArray(object[key], replaceFrom, replaceTo);
            else if (js0.type(object[key], js0.RawObject))
                Layout._Replace_ReplaceInObject(object[key], replaceFrom, replaceTo);
        }
    }

    static _Replace_ParseFields(string)
    {
        let lTextsArr = [];

        let r = /[^\\]\${?([a-zA-Z0-9._]+)}?(\(.*\))?/g;
        let offset = 0;
        while(true) {
            let match = r.exec(string);
            if (match === null)
                break;

            let text = string.substring(offset, match.index);
            if (text !== '')
                lTextsArr.push(text);

            let args = typeof match[2] === 'undefined' ? '' : match[2];
            lTextsArr.push(`$${match[1]}${args}`);
            offset = match.index + match[0].length;
        }

        let text = string.substring(offset);
        if (text !== '')
            lTextsArr.push(text);

        return lTextsArr;
    }


    constructor(layoutContent)
    {
        js0.args(arguments, Array);
        js0.prop(this, Layout.Viewable, this);

        let layoutParser = new LayoutParser();
        for (let ext of Layout.Extensions)
            layoutParser.extend(ext);
        let layoutNode = layoutParser.parse(layoutContent);

        this._fields = layoutParser.fields;
        this._data = layoutParser.data;
        this._elems = layoutParser.elems;
        this._holders = layoutParser._holders;

        Object.defineProperties(this, {
            $fields: {
                get: () => {
                    return this._fields.$value;
                },
                set: (value) => {
                    this._fields.$value = value;
                },
            },

            $data: { value: this._data, },
            $elems: { value: this._elems, },
            $holders: { value: this._holders, },

            _layoutNode: { value: layoutNode, },
        });
    }

    _parse(layoutContent)
    {
        
    }

}
module.exports = Layout;


Object.defineProperties(Layout, {

    Extensions: { value: [], },

    Viewable: { value:
    class Layout_Viewable extends Viewable {

        constructor(layout)
        { super();
            this._layout = layout;
        }

        __activate(parentNode)
        {
            parentNode.pChildren.add(this._layout._layoutNode);
            // console.log('Adding child:', this._layout._layoutNode, 'to', parentNode);
            // this._layout._layoutNode.activate();
        }

        __deactivate(parentNode)
        {
            parentNode.pChildren.remove(this._layout._layoutNode);
            // this._layout._layoutNode.deactivate();
        }

    }},

});
