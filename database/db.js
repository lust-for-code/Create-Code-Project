'use strict';
require('dotenv').config();
const mysql = require('mysql');

const config = {
    database: {
        host: process.env.HOST,
        user: process.env.USER,
        password: process.env.PASSWORD,
        database: process.env.DATABASE

    }

}


class Database {

    constructor() {
        this._config = config.database
        this._dbconn = mysql.createConnection(config.database);
        this._dbconn.connect();
    }
    statement(query, params = []) {
        let _this = this;

        return new Promise((resolve, reject) => {
            _this._dbconn.query(query, params, (err, results) => {
                if (err) {
                    reject(err);
                    return;
                }

                resolve(results);
            });
        });
    };
}

module.exports = Database;