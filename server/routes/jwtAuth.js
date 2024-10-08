const router = require('express').Router();
const pool = require('../db');
const bcrypt = require('bcrypt');
const jwtGenerator = require('../utils/jwtGenerator');
const validInfo = require("../middleware/validInfo");
const authorization = require("../middleware/authorization");


// registering

router.post("/register", validInfo, async (req,res) => {
    try {
        console.log(req.body)
        // 1. destructure req.body (name, email, password)
        const {name, email, password} = req.body;
        // 2. check if user exists (if exists throw error)
        const user = await pool.query("SELECT * FROM account WHERE user_email = $1",[email]);
        if(user.rows.length !== 0) {
            return res.status(401).json("User already exists");
        }
        // 3. Bcrypt user password
        const saltRound = 10;
        const salt = await bcrypt.genSalt(saltRound);

        const bcryptPassword = await bcrypt.hash(password, salt);

        // 4. enter new user into DB
        const newUser = await pool.query("INSERT INTO account (user_name,user_email,user_password) VALUES ($1,$2,$3) RETURNING *;",[name, email, bcryptPassword]);


        
        // 5. generate JWT token
        const token = jwtGenerator(newUser.rows[0].user_id);

        res.json({token});
        
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server Error")
    }
})

// login route

router.post("/login", validInfo, async (req,res) => {
    try {
        // 1. destructure req.body
        const {email, password} = req.body;
        
        // 2. check if user doesnt exist
        const user = await pool.query("SELECT * FROM account WHERE user_email = $1",[email]);

        // 3. check if incoming password is the same as db password
        if(user.rows.length === 0){
            return res.status(401).json("Email or Password incorrect");
        }

        const validPassword = await bcrypt.compare(password, user.rows[0].user_password);
        if (!validPassword){
            return res.status(401).json("Email or Password incorrect");
        }

        // 4. give them JWT token
        const token = jwtGenerator(user.rows[0].user_id);

        res.json({token});


    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server Error")
    }
})

// Verify
router.get("/is-verify", authorization, async (req, res) => {
    try {
        res.json(true)
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server Error")       
    }
})

module.exports = router;