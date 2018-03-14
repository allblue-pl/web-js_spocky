'use strict';

const RootField = require('../fields/RootField');


let fields = new RootField();

let field_paths = [
    't1', 't2', 't3', 't4', 't5', 't6', 't7', 't8', 't9', 't10',
    't11', 't12',
    't2.t3',
    't4.t5',
    't6.t7',
    't6.t7.t8',
    't9.t10',
    't9.t10.t11',
];
field_paths.forEach((field_path) => {
    fields.$define(field_path, {
        onChange: (value) => {
            console.log(field_path, 'change', value);
        }
    });
});

fields.$define('t6', {
    onSet: (field_name, field_value) => {
        console.log('t6', 'set', field_name, '=>', field_value);
    },
    onDelete: (field_name) => {
        console.log('t6', 'delete', field_name);
    },
});

/* Set Var */
// fields.$set('t1', 1)
// console.log('Set Var', fields.$get('t1'));
//
// /* Set Object */
// fields.$set('t2.t3', 2);
// console.log('Set Object', fields.$get('t2.t3'))
//
// /* Set Object From Object */
// fields.$set('t4', { t5: 3 });
// console.log('Set Object From Object 1', fields.$get('t4.t5'));

fields.$set('t6.t7', { t8: 4 });
console.log('Set Object From Object 2', fields.$get('t6.t7.t8'));

// fields.$set('t9.t10', { t11: 5 });
// console.log('Set Object From Object 3', fields.$get('t9.t10.t11'));
//
// /* Delete */
// fields.$delete('t1', fields.$get('t1'));
// console.log('Delete', fields.$get('t1'));
//
// fields.$delete('t2', fields.$get('t2'));
// console.log('Delete Object', fields.$get('t2.t3'));

/* Replace */
fields.$set('t6', 6);
console.log('Replace', fields.$get('t6'), fields.$get('t6.t7'),
        fields.$get('t6.t7.t8'));

// fields.$delete('t2')

// fields.$set('a', 5);
// console.log('a', fields.$get('a'));
// fields.a = 10;
//
// fields.$set('b', 15);
// console.log('b', fields.b);
//
// console.log('b.c', fields.$get('b.c'));
// fields.b.c = 20;
//
// fields.b = {
//     c: 25,
// };

// console.log('Objects');
// fields.$set('b', 1);
// fields.$set('b.c', 2);
// fields.$set('b.c', {
//     d: 3,
// });
