'use strict';

const abTypes = require('ab-types');

const abNodes = require('../ab-nodes');

const Elem = require('./Elem');


class Elems
{

    constructor()
    {

    }

    _$addStatic(elem_name, html_element)
    {
        abTypes.argsE(arguments, 'string', HTMLElement);

        Object.defineProperty(this, elem_name, { value: html_element, }, );
    }

    _$addVirtual(elem_name, node)
    {
        abTypes.argsE(arguments, 'string', [ abNodes.Node,
                abTypes.Prop(abNodes.Node.PCopyable) ]);

        Object.defineProperty(this, elem_name, {
            value: new Elem(node),
        });
    }

}
module.exports = Elems;
