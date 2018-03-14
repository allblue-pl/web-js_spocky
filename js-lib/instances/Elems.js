'use strict';

const js0 = require('js0');

const abNodes = require('ab-nodes');

const Elem = require('./Elem');


class Elems
{

    constructor()
    {

    }

    _$addStatic(elem_name, html_element)
    {
        js0.args(arguments, 'string', HTMLElement);

        Object.defineProperty(this, elem_name, { value: html_element, }, );
    }

    _$addVirtual(elem_name, node)
    {
        js0.args(arguments, 'string', [ abNodes.Node,
                js0.Prop(abNodes.Node.PCopyable) ]);

        Object.defineProperty(this, elem_name, {
            value: new Elem(node),
        });
    }

}
module.exports = Elems;
