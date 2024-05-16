const connection = require('../DB-Connection/db-conn');
const validator = require('validator');
const bcryptjs = require('bcryptjs');


const create = async (req, res) => {
    try {
        const userData = req.body;
        const { email, phno, password } = userData;

        if (!validator.isEmail(email)) {
            return res.status(400).json({ message: "Invalid Email" });
        }

        if (phno.toString().length !== 10) {
            return res.status(400).json({ message: "Phone Number Must be 10 Digits" });
        }

        connection.query(`SELECT * FROM users WHERE email = ?`, [email], (error, results) => {
            if (error) {
                console.error('Error querying database:', error);
                return res.status(500).json({ message: "Internal Server Error" });
            }
            if (results.length > 0) {
                return res.status(409).json({ message: "Email already exists" });
            }
        });

        connection.query(`SELECT * FROM users WHERE phno = ?`, [phno], (error, results) => {
            if (error) {
                console.error('Error querying database:', error);
                return res.status(500).json({ message: "Internal Server Error" });
            }
            if (results.length > 0) {
                return res.status(409).json({ message: "Phone number already exists" });
            }
        });
        const hashedPassword = await bcryptjs.hash(password, 8)
        const sql = `INSERT INTO users(name, email, phno, password, status, adminId) 
                             VALUES(?, ?, ?, ?, ?, ?)`;
        const values = [userData.name, userData.email, userData.phno, hashedPassword, userData.status, userData.adminId];
        connection.query(sql, values, (error, result) => {
            if (error) {
                console.error('Error inserting row:', error);
                return res.status(500).json({ message: "Internal Server Error" });
            }
            res.json({ message: 'User created successfully' });
        });
    }
    catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Error occurred' });
    }
}

const login = async (req, res) => {
    try {
        const userData = req.body;
        const { email, password } = userData;
        if (!validator.isEmail(email)) {
            res.status(400).json({ message: 'Invalid email' });
            return;
        }

        const sql = `select * from users where email = ?`;

        connection.query(sql, [email], async (error, result) => {
            if (error) {
                throw error;
            }
            if (result.length == 0) {
                res.status(400).json({ message: 'User not found' });
                return;
            }
            const user = result[0];
            const isValidPassword = await bcryptjs.compare(password, user.password);
            if (!isValidPassword) {
                res.status(400).json({ message: 'Incorrect password' });
                return;
            }
            if (user.status === 0) {
                res.status(400).json({ message: 'User not activated' });
                return;
            }
            res.status(200).json({ message: "Login Successful!" });
        });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ error: 'Error during login' });
    }
}

const fetch = (req, res) => {
    try {
        const adminId = req.query.adminId;
        const limit = +req.query.limit || 100;
        const offset = +req.query.offset || 0;
        const sortBy = req.query.sortBy || '_id';
        const sortOrder = req.query.sortOrder || 'asc';
        const filterValue = req.query.filterValue || '';

        const sql = `SELECT * FROM users WHERE adminId = ? AND (name LIKE '%${filterValue}%' OR  email LIKE '%${filterValue}%' 
         OR phno LIKE '%${filterValue}%') ORDER BY ${sortBy} ${sortOrder} LIMIT ${limit} OFFSET ${offset}`;

        connection.query(sql, [adminId], (error, result) => {
            if (error) {
                throw error;
            }
            res.json(result);
        });
    } catch (error) {
        console.error('Error fetching rows:', error);
        res.status(500).json({ error: 'Error fetching rows' });
    }
}

const update = async (req, res) => {
    try {
        const id = req.params.id;
        const allowedUpdates = ['name', 'password', 'status'];
        const updates = Object.keys(req.body);

        const isValidUpdate = updates.every((update) => allowedUpdates.includes(update));
        if (!isValidUpdate) {
            return res.status(400).json({ message: 'Invalid updates' });
        }

        if (req.body.password) {
            req.body.password = await bcryptjs.hash(req.body.password, 8);
        }

        const updatesObject = {};
        updates.forEach((update) => {
            updatesObject[update] = req.body[update];
        });

        const sql = `UPDATE users SET ? WHERE _id = ?`;
        connection.query(sql, [updatesObject, id], (error, result) => {
            if (error) {
                console.error('Error updating user:', error);
                return res.status(500).json({ error: 'Internal server error' });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.status(200).json({ message: 'User updated successfully' });
        });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

const deleteUser = (req, res) => {
    try {
        const id = req.params.id;
        const sql = `DELETE FROM users WHERE _id = ?`;

        connection.query(sql, [id], (error, result) => {
            if (error) {
                throw error;
            }
            if (result.affectedRows === 0) {
                res.status(404).json({ error: 'User not found' });
                return;
            }
            res.status(200).json({ message: "User deleted successfully" });
        });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = { create, login, fetch, update, deleteUser };
