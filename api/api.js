const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Content = require('../models/Content');
let responseData;
router.use(function(req, res, next){
    responseData = {
        code: 0,
        message: ''
    }
    next()
})
/* 
    用户注册
        注册逻辑
            1.用户名不能为空
            2.密码不能为空
            3.两次密码是否一致
            4.用户名是否被注册 -->查询数据库
 */
router.post('/user/register', (req, res) => {
    var username = req.body.username;
    var password = req.body.password;
    var repassword = req.body.repassword;
    if (!username) {
        responseData.code = 1;
        responseData.message = '用户名不能为空';
        res.json(responseData);
        return
    }
    if(!password) {
        responseData.code = 2;
        responseData.message = '密码不能为空';
        res.json(responseData);
        return
    }
    if (repassword !== password) {
        responseData.code = 3;
        responseData.message = '两次密码不一致';
        res.json(responseData);
        return
    }
    User.findOne({
        username: username
    }).then(function(userInfo) {
        if(userInfo) {
            responseData.code = 4;
            responseData.message = '用户名已存在';
            res.json(responseData);
            return
        }
        var user = new User({
            username: username,
            password: password
        })
        return user.save()
    }).then(function(newUserInfo){
        responseData.message = '注册成功';
        res.json(responseData);
        /*  
            注册成功设置cookies直接登陆逻辑 
        */
    })
})
/* 
    用户登陆
 */
router.post('/user/login', function(req, res, next){
    var username = req.body.username;
    var password = req.body.password;
    if (username == '' || password == '') {
        responseData.code = 1;
        responseData.message = '账户或者密码不能为空';
        res.json(responseData);
        return
    }
    User.findOne({
        username: username,
        password: password
    }).then(function(userInfo){
        if(!userInfo) {
            responseData.code = 2;
            responseData.message = '账户或者密码错误';
            res.json(responseData);
            return
        }
        responseData.message = '登陆成功';
        //设置cookies信息
        req.cookies.set('userInfo',JSON.stringify({
                _id: userInfo._id,
                username: userInfo.username
            }
        )); 
        responseData.userInfo = {
            _id: userInfo._id,
            username: userInfo.username
        }
        res.json(responseData)
    })
})
/* 
    退出
    设置cookies信息为null
 */
router.get('/user/logout', function(req, res, next){
    req.cookies.set('userInfo', null)
    res.json(responseData)
})


/**
 * 获取评论
 */

router.get('/comment', (req, res, next) => {
    var contentid = req.query.contentid;
    Content.findOne({
        _id: contentid
    }).then((content) => {
        responseData.message = 'ok';
        responseData.data = content
        res.json(responseData)
    })
})
/**
 * 提交评论
 */
router.post('/comment/post', (req, res, next) => {
    var contentid = req.body.contentid;
    var postData = {
        username: req.userInfo.username,
        postTime: new Date(),
        content: req.body.content
    }
    Content.findOne({
        _id: contentid
    }).then((content) => {
        content.comments.push(postData)
        return content.save()
    }).then((newContent) =>{
        responseData.message = '评论成功';
        responseData.data = newContent;
        res.json(responseData)
    })
})
module.exports = router;