'use strict';

const Page = require('../instances/Page');
const PageInfo = require('./PageInfo');


class Uri
{

    constructor(config_info)
    {
        this._config = config_info;
    }

    parse(uri)
    {
        let config = this._config;

        let page_infos = config.pages;
        if (page_infos.length === 0)
            throw new Error('No pages defined in config.');

        let base_uri = config.baseUri;

        if (uri.indexOf(base_uri) !== 0) {
            window.location = base_uri;
            return null;
        }

        uri = uri.substring(base_uri.length);

        for (let page_info of page_infos.values()) {
            let page_args = page_info.matchesUri(uri);
            if (page_args !== null)
                return new Page(page_info, page_args);
        }

        return null;
    }

}
module.exports = Uri;


Object.defineProperties(this, {

    Info: { value:
    class Uri_Info {

        constructor(uri)
        {
            this.uri = uri;
            this.args = {};

            let search_start = uri.lastIndexOf('?');
            if (search_start !== false) {
                this.uri = uri.substring(search_start + 1);
                this._parseSearch(uri.substring(0, search_start));
            }
        }

        _parseSearch(search)
        {
            var args_array = search.split("&");
            for (let arg_info of args_array) {
                let arg_pair = arg_info.split("=");
                let arg_name = arg_pair[0];
                let arg_value = arg_pair.length > 1 ?
                        decodeURIComponent(arg_pair[1]) : '';

                if (!(arg_name in this.args))
                    this.args[arg_name] = decodeURIComponent(arg_value);
                else {
                    if (typeof this.args[arg_name] === 'string')
                        this.args[arg_name] = [ this.args[arg_name], arg_value ];
                    else
                        this.args[arg_name].push(arg_value);
                }
              }
        }

    }}

});
