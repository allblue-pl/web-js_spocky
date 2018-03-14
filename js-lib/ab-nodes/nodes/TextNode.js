'use strict';

const abTypes = require('ab-types');

const HtmlElement = require('../HtmlElement');
const Node = require('../Node');


class TextNode extends Node
{

    get text() {
        return this._htmlElement.nodeValue;
    }
    set text(value) {
        this._htmlElement.nodeValue = value;
    }


    constructor(text)
    { super();
        abTypes.prop(this, TextNode.PCopyable, arguments);

        this._text = text;
        this._htmlElement = document.createTextNode(text);
    }


    /* Node */
    __onActivate()
    {
        abTypes.assert(this.parentNode !== null, 'Parent node not set.');

        HtmlElement.AddChild(this.parentNode.htmlElement, this._htmlElement,
                this.nextHtmlElement);
    }

    __onDeactivate()
    {
        HtmlElement.RemoveChild(this.parentNode.htmlElement, this._htmlElement);
    }

    __getHtmlElement()
    {
        return this._htmlElement;
    }

    __getFirstHtmlElement()
    {
        if (!this.active)
            return null;

        return this._htmlElement;
    }
    /* / Node */

}
module.exports = TextNode;


Object.defineProperties(TextNode, {

    PCopyable: { value:
    class TextNode_PCopyable extends Node.PCopyable
    {

        constructor(node, args)
        { super(node, args);

        }

        __createCopy() {
            return new TextNode(this.__args[0]);
        }

    }},

});
