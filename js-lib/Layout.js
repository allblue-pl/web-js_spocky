'use strict';

const 
    abTextParser = require('ab-text-parser'),
    js0 = require('js0'),

    LayoutParser = require('./LayoutParser'),
    Viewable = require('./Viewable')
;

class Layout
{

    static Replace(layoutContent, replaceArr)
    {
        js0.args(arguments, Array, Array);

        Layout._Replace_ReplaceInArray(layoutContent, replaceArr);
    }

    static _Replace_ReplaceInArray(array, replaceArr)
    {
        for (let i = 0; i < array.length; i++) {
            if (typeof array[i] === 'string') {
                let newString = array[i];
                for (let replace of replaceArr) {
                    newString = newString.replace(new RegExp(replace[0], 'g'), 
                            replace[1]);
                }
        
                let newStringArr = abTextParser.parse(newString);

                array.splice(i, 1);
                for (let j = 0; j < newStringArr.length; j++)
                    array.splice(i + j, 0, newStringArr[j]);
        
                i += newStringArr.length - 1;
            } else if (js0.type(array[i], Array))
                Layout._Replace_ReplaceInArray(array[i], replaceArr);
            else if (js0.type(array[i], js0.RawObject))
                Layout._Replace_ReplaceInObject(array[i], replaceArr);
        }
    }

    static _Replace_ReplaceInObject(object, replaceArr)
    {
        for (let key in object) {
            if (js0.type(object[key], 'string')) {
                let newString = object[key];
                for (let replace of replaceArr) {
                    newString = newString.replace(new RegExp(replace[0], 'g'), 
                            replace[1]);
                }

                object[key] = newString;
            } else if (js0.type(object[key], Array))
                Layout._Replace_ReplaceInArray(object[key], replaceArr);
            else if (js0.type(object[key], js0.RawObject))
                Layout._Replace_ReplaceInObject(object[key], replaceArr);
        }
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
        this._$data = layoutParser.data;
        this._$elems = layoutParser.elems;
        this._$holders = layoutParser.holders;

        Object.defineProperties(this, {
            $fields: {
                get: () => {
                    return this._fields.$value;
                },
                set: (value) => {
                    this._fields.$value = value;
                },
            },

            $data: { value: this._$data, },
            $elems: { value: this._$elems, },
            $holders: { value: this._$holders, },

            _$layoutNode: { value: layoutNode, },

            _$listeners_OnDisplay: { value: [], },
        });

        layoutNode.addListener_OnDisplay((display) => {
            for (let listener of this._$listeners_OnDisplay)
                listener(display);
        });
    }

    $onDisplay(listener)
    {
        if (this._$viewable.active)
            listener();
        this._$listeners_OnDisplay.push(listener);
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
            parentNode.pChildren.add(this._layout._$layoutNode);
            // console.log('Adding child:', this._layout._$layoutNode, 'to', parentNode);
            // this._layout._$layoutNode.activate();
        }

        __deactivate(parentNode)
        {
            parentNode.pChildren.remove(this._layout._$layoutNode);
            // this._layout._$layoutNode.deactivate();
        }

    }},

});
