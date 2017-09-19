'use strict';


class VarField extends Field
{

    __getField(field_path)
    {
        let value_type = typeof this.value;
        throw new Error(`Wrong field path. \`${this._fullPath}\` is a ` +
                `\`${value_type}\`.`);
    }

}
