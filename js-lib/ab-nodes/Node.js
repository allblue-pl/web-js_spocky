'use strict';

const abTypes = require('ab-types');


class Node
{

    get active() {
        return this._active;
    }

    get firstHtmlElement() {
        let first_html_element = this.__getFirstHtmlElement();
        if (!abTypes.var(first_html_element, HTMLElement)) {
            throw new Error(`\`__getFirstHtmlElement\` in \`${this.constructor.name}\`` +
                    `does not return \`HTMLElement\`.`);
        }

        return first_html_element;
    }

    get htmlElement() {
        let html_element = this.__getHtmlElement();
        if (!abTypes.var(html_element, HTMLElement)) {
            throw new Error(`\`__getHtmlElement\` in \`${this.constructor.name}\`` +
                    `does not return \`HTMLElement\`.`);
        }

        return html_element;
    }

    get nextHtmlElement() {
        return this.nextNode === null ? null : this.nextNode.firstHtmlElement;
    }

    get nextNode() {
        return this.parentNode.pChildren.__getNext(this);
    }

    get parentNode() {
        if (this._parentNode === null)
            throw new Error('Parent node not set.');

        return this._parentNode;
    }


    constructor()
    {
        this._active = false;
        this._listener = null;
        this._parentNode = null;
    }

    activate()
    {
        if (this.active)
            return;

        this.__onActivate();
        this._active = true;
    }

    deactivate()
    {
        if (!this.active)
            return;

        this.__onDeactivate();
        this._active = false;
    }


    __onActivate() { abTypes.virtual(); }
    __onDeactivate() { abTypes.virtual(); }

    __getHtmlElement() { abTypes.virtual(); }
    __getFirstHtmlElement() { abTypes.virtual(); }

}
module.exports = Node;
require('./Node.PChildren');
require('./Node.PCopyable');
