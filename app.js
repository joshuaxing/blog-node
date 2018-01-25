const express = require('express');
//创建app应用 ->NodeJS Http.createServer()
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const swig = require('swig');
const Cookies = require('cookies');
const User = require('./models/User')

/**
 * 设置静态文件托管
 * 当用户访问的url以public开始,那么直接返回对应的path.join(__dirname, 'public')下的文件
 */
app.use('/public',express.static(path.join(__dirname, 'public')))
/*
    配置应用模板
    定义当前应用使用的模板
    @param1-->模板引擎的名称，也是模板文件的后缀
    @param2-->解析处理模板内容的方法
 */
app.engine('html', swig.renderFile);

/*
    设置模板存放的目录
    @param1-->必须是views
    @param2-->模板存放的目录
 */
app.set('views', path.join(__dirname, 'views'))

/* 
    注册所使用的模板引擎
    @param1-->必须是view engine
    @param2-->和app.engine的@param1一致
 */
app.set('view engine', 'html');

/* 
    开发过程中，取消模板缓存
 */
swig.setDefaults({cache: false});

/*
    bodyParser设置 作用：用来post提交过来的数据
 */
app.use(bodyParser.urlencoded({extended: true}))

/* 
    全局设置Cookies目的
    对于通过身份验证的用户，Server会偷偷的在发往Client的数据中添加Cookie，Cookie中一般保存一个标识该Client的唯一的ID，
    Client在接下来对服务器的请求中，会将该ID以Cookie的形式一并发往Server，Server从回传回来的Cookie中提取ID并与相应的用户绑定起来，从而实现身份验证。
 */
app.use(function(req, res, next) {
    //注册cookies
    req.cookies = new Cookies(req, res)
    req.userInfo = {};
    //解析登陆用户的cookies信息
    if(req.cookies.get('userInfo')) {
        try{
            req.userInfo = JSON.parse(req.cookies.get('userInfo'))
            //添加req.userInfo.isAdmin，用于判断是否是管理员
            User.findById(req.userInfo._id).then(function(userInfo){
                req.userInfo.isAdmin = Boolean(userInfo.isAdmin)
                next()
            })
        }catch(e){
            next()
        }
    } else {
        next();
    }
})

/* 
    根据不同的功能划分模块
 */
app.use('/admin', require('./routers/admin.js'))
app.use('/api', require('./api/api.js'));
app.use('/', require('./routers/router.js'));

let port = 8088
mongoose.connect('mongodb://localhost:27017/blog', (err) => {
    if (err) {
        console.warn('数据库连接失败')
    } else {
        console.log('数据库连接成功')
        app.listen(port, function(){
            console.log(`运行端口号为${port}`)
        })
    }
})

