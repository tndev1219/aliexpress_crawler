const mysql = require('mysql');

class AliList {

    constructor() { }

    static insertUpdateAliListSQL(rows) {
        const values = [];
        var key_list = [];

        Object.keys(rows[0]).forEach(key => {
            key_list.push(key);
        });

        let arr = [];
        rows.forEach(item => {
            let t_arr = [];
            key_list.forEach(key => {
                t_arr.push('?');
                values.push(item[key]);
            });

            arr.push(`( ${t_arr.join(',')})`);
        });

        let values_str = arr.join(",");
        arr = [];

        key_list.forEach(key => {
            if ((key == 'product_url') || (key == 'category_id') || (key == 'category_url')) {
                arr.push(`${key}=IF(${key} is null, ${key}, values(${key}))`);
            } else {
                arr.push(`${key}=VALUES(${key})`);
            }
        });

        let update_value_str = arr.join(",");

        let insertQuery = `INSERT INTO aliexpress_list (${key_list}) VALUES ${values_str} ON DUPLICATE KEY UPDATE ${update_value_str}`;
        let query = mysql.format(insertQuery, values);

        return query;
    }
}

module.exports = AliList;