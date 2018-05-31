'use strict';


class PageInfo
{

    constructor(page_name, page_alias)
    {
        Object.defineProperties(this, {
            name: { value: page_name, },
            alias: { value: page_alias, },
            regexp: { value: null, writable: true, },
            argNames: { value: [], },
        });

        this._parseAlias(page_alias);
    }

    matchesUri(uri)
    {
        if (this.regexp === null) {
            if (uri === this.alias)
                return {};

            return null;
        }

        let match = this.regexp.exec(uri);
        if (match === null)
            return null;

        let args = {};
        for (let i = 1; i < match.length; i++)
            args[this.argNames[i - 1]] = match[i];

        return args;
    }


    _escapeRegexp(string)
    {
        return string.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
    }

    _parseAlias(alias)
    {
        let has_extension = alias.lastIndexOf('/*') === alias.length - 2;
        if (has_extension)
            alias = alias.substring(0, alias.length - 2);

        let args_regexp = /:[a-zA-Z0-9]+/g;
        let arg_matches = [];

        for (;;) {
            let t_arg_match = args_regexp.exec(alias);
            if (t_arg_match === null)
                break;
            arg_matches.push(t_arg_match);
            this.argNames.push(t_arg_match[0].substring(1));
        }

        if (arg_matches.length === 0) {
            if (has_extension)
                this.regexp = new RegExp(this._escapeRegexp(alias) + '/.*$');

            return;
        }

        let regexp_str = this._escapeRegexp(alias).replace(args_regexp, '([^/]+?)');
        if (has_extension)
            regexp_str += '/.*';
        this.regexp = new RegExp(regexp_str + '$');
    }

}
module.exports = PageInfo;
