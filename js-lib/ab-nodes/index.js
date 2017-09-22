'use strict';

const HideNode = require('./nodes/HideNode');
const Node = require('./Node');
const RepeatNode = require('./nodes/RepeatNode');
const RootNode = require('./nodes/RootNode');
const ShowNode = require('./nodes/ShowNode');
const SingleNode = require('./nodes/SingleNode');
const TextNode = require('./nodes/TextNode');


class abNodes_Class
{

    get HideNode() {
        return HideNode;
    }

    get Node() {
        return Node;
    }

    get RepeatNode() {
        return RepeatNode;
    }

    get RootNode() {
        return RootNode;
    }

    get ShowNode() {
        return ShowNode;
    }

    get SingleNode() {
        return SingleNode;
    }

    get TextNode() {
        return TextNode;
    }

};
module.exports = new abNodes_Class();
