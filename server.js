const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const mongooDbUrl = 'mongodb://localhost:27017/nodeMailer'
require("dotenv").config();

const User = require('./models/user')
const app = express();
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

//连接数据库
mongoose.connect(mongooDbUrl,
    { useNewUrlParser: true }
).then(() => console.log('MongoDB connected...')).catch(err => console.log(err));

app.get('/', (req, res) => {
    res.json({ state: 'suc', msg: 'it works' })
})

app.post('/retrievePwd', (req, res) => {
    User.findOne({ username: req.body.username }).then(user => {
        // console.log(req.body.username)
        if (!user) {
            res.status(400).json({
                state: 'failed',
                msg: '用户不存在1'
            });
        } else {
            //第一步
            let transporter = nodemailer.createTransport({
                service: "qq",
                secure: true,
                auth: {
                    user: process.env.EMAIL,
                    pass: process.env.PASSWORD
                }
            });

            //第二部
            let mailOptions = {
                from: "105257109@qq.com",
                to: req.body.email,
                subject: "找回密码",
                text: '您的用户名:' + user.username + "密码：" + user.password
            }

            //第三部
            transporter.sendMail(mailOptions, (err, data) => {
                if (err) {
                    res.status(400).json({
                        state: "failed",
                        msg: err
                    })
                } else {
                    res.status(200).json({
                        state: 'suc',
                        msg: `密码已发送至您的邮箱${req.body.email}`
                    });
                }

            })
        }

    })
})

app.post('/addUser', (req, res) => {
    //res.json({ state: 'suc', msg: 'it works' })
    //console.log(req.body)
    User.findOne({ username: req.body.username }).then(user => {
        console.log(user)
        if (user) {
            res.status(400).json({
                state: "failed",
                msg: '该用户已存在'
            });
        } else {
            const newUser = new User({
                username: req.body.username,
                password: req.body.password,
                email: req.body.email
            });

            newUser.save().then((user) => {
                res.status(200).json({
                    state: 'suc',
                    msg: '添加成功',
                    data: user
                }).catch(err => console.log(err));

            })
        }
    })
})


const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log('服务正在运行中，端口为:' + port);
})