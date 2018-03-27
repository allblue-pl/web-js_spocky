'use strict';

const js0 = require('js0');

// const Module = require('../instances/Module');


class ContainerInfo
{

    constructor(containerId, htmlElement, modulePath)
    {
        js0.args(arguments, 'string', HTMLElement, 'string');

        Object.defineProperties(this, {
            id: { value: containerId, },
            htmlElement: { value: htmlElement, },
            modulePath: { value: modulePath, },
        });
    }

}
module.exports = ContainerInfo;
