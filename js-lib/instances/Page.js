'use strict';

const js0 = require('js0');

const PageInfo = require('../core/PageInfo');


class Page
{

    constructor(page_info, page_args)
    {
        js0.args(arguments, PageInfo, 'object');

        Object.defineProperties(this, {
            info: { value: page_info, },
            args: { value: page_args, },
        });
    }

}
module.exports = Page;
