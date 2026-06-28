const cookieParser = require('cookie-parser')
const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const app = express()
app.use(cookieParser())

app.get('/', (req, res) => {
    let token = jwt.sign({ eamil: "j0hn342@gmail.com" }, "secret")
    res.cookie("token", token)
    console.log("done")
})


app.get('/read', (req, res) => {
    console.log(req.cookies.token)
})

app.get('/read', (req, res) => {
    let data = jwt.verify(req.cookie.token, "token")
    console.log(data)
})

// app.get('/', (req, res) => {
//     bcrypt.genSalt(10, function (err, salt) {
//         bcrypt.hash("polopolopolopolo", salt, function (err, hash) {
//             // Store hash in your password DB.
//             console.log(hash)
//             console.log(salt)
//         });
//     });
// })


app.listen(3000);