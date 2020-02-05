-- creating login table

CREATE TABLE login (id INTEGER PRIMARY KEY, 
                    email VARCHAR(80) UNIQUE NOT NULL, 
                    password VARCHAR(150) NOT NULL, 
                    lastlogin DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP);


-- creating code table

CREATE TABLE code ( _id INTEGER AUTO_INCREMENT PRIMARY KEY, 
                    _state VARCHAR(20) NOT NULL, 
                    a_type VARCHAR(1) NOT NULL, 
                    d_type VARCHAR(1) NOT NULL, 
                    code VARCHAR(7) NOT NULL, 
                    ref_no INTEGER NOT NULL, 
                    userid INTEGER NOT NULL, 
                    created DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, 
                    FOREIGN KEY (userid) REFERENCES login(id)  ON DELETE RESTRICT ON UPDATE CASCADE );