'use strict';

const abTypes = require('../ab-types');

const PageInfo = require('../core/PageInfo');


class Page
{

    constructor(page_info, page_args)
    {
        abTypes.args(arguments, PageInfo, 'object');

        Object.defineProperties(this, {
            info: { value: page_info, },
            args: { value: page_args, },
        });
    }

}
module.exports = Page;
