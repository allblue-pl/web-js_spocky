'use strict';

const abLayouts = require('../ab-layouts');
const abNodes = require('../ab-nodes');
const abTypes = require('../ab-types');


class LayoutParser extends abLayouts.Parser
{

    __createNode(node_info)
    {
        let node = null;

        let node_type = node_info.type;
        let node_attribs = node_info.attribs;
        let node_content = node_info.content;

        let layout_node_presets = {};

        if (node_type[0] === '_') {
            console.error('Error info:', node_type, node_content);
            throw new Error('Attrs are only allowed in first attribute node.');
        } else if (node_type[0] === '$') {
            if (node_type === '$repeat')
                node = new abNodes.RepeatNode();
            else if (node_type === '$root') {
                if (!('_element' in node_attribs))
                    throw new Error('`_element` attrib not set in root layout.');
                node = new abNodes.RootNode(node_attribs._element);
            } else if (node_type === '$show')
                node = new abNodes.ShowNode();
            else if (node_type === '$text') {
                let text = '_text' in node_attribs ?
                        node_attribs._text : '';
                node = new abNodes.TextNode(text);
            } else {
                console.error('Error info:', node_type, node_content);
                throw new Error('Unknown node type `' + node_type + '`.');
            }
        } else
            node = new abNodes.SingleNode(node_type);


        abTypes.assert(node !== null, '`node` shouldn\'t be `null`.');

        return node;
    }

}
module.exports = LayoutParser;
