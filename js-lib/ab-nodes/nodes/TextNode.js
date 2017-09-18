'use strict';

const abTypes = require('../../ab-types');

const HtmlElement = require('../HtmlElement');
const Node = require('../Node');


class TextNode extends Node
{

    constructor(text)
    { super();
        abTypes.prop(this, TextNode.PCopyable, this, arguments);

        this._text = text;
        this._htmlElement = document.createTextNode(text);
    }


    /* Node */
    __onNodeActivate()
    {
        abTypes.assert(this.parentNode !== null, 'Parent node not set.');

        HtmlElement.AddChild(this.parentNode.htmlElement, this._htmlElement,
                this.nextHtmlElement);
    }

    __onNodeDeactivate()
    {
        HtmlElement.RemoveChild(this.parentNode.htmlElement, this._htmlElement);
    }

    __getNodeHtmlElement()
    {
        return this._htmlElement;
    }

    __getNodeFirstHtmlElement()
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

        copy(deep_copy) {
            return new TextNode(this.__args[0]);
        }

    }},

});
