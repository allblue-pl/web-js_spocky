'use strict';

const js0 = require('js0');

// const Module = require('../instances/Module');


class ContainerInfo
{

    constructor(containerId, htmlElement, moduleClass)
    {
        js0.args(arguments, 'string', HTMLElement, 'function');

        Object.defineProperties(this, {
            id: { value: containerId, },
            htmlElement: { value: htmlElement, },
            moduleClass: { value: moduleClass, },
        });
    }

}
module.exports = ContainerInfo;
