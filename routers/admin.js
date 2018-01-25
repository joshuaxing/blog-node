/**
 * var Model = mongoose.model('Model', nameSchema)操作
 * .count()->数据总条数
 * .find()->查找全部数据
 * .findOne({})->查找一条数据
 * .findById(_id) ->查找一条_id数据
 * .limit(number)->每页显示的数据条数
 * .skip(number)->忽略的数据条数
 * .populate([refName1, refName2]) //关联
 * .where({})查询条件
 * .sort({_id})
 *      1->表示升序
 *      -1->表示降序
 * 表示不等于id
 *  Model.findOne({
 *      _id: {$ne: id}
 *      name: name
 *  })
 * Model.remove({id}).then()->删除一条数据
 * Model.update({id},{data}).then() ->更新数据
 * 保存数据
 *  new Model({data}).save().then()
 * 
 * Math对象
 * Math.ceil()->向上取整
 * Math.min(x,y)->取x和y的最小值
 * Math.max(x,y)->取x和y的最大值
 * 
 * Promise.reject()
 * 
 * swig模板
 * {{content.addTime|date('Y-m-d H:i:s', -8*60)}}
 */
var express = require('express');
var router = express.Router();
var User = require('../models/User')
var Category = require('../models/Category')
var Content = require('../models/Content')
/**
 * 非管理人员
 */
router.use(function(req, res, next){
    if(!req.userInfo.isAdmin) {
        res.send('对不起，非管理员没有权限')
        return;
    }
    next()
})
/**
 * 后台管理首页
 */
router.get('/',function(req, res, next){
    res.render('admin/index',{
        userInfo: req.userInfo
    })
})

/**
 * 用户管理 /admin/user
 */
router.get('/user', function(req, res, next){
    
    let page = Number(req.query.page || 1);
    const limit = 2;
    let pages = 0;
    User.count().then((count) => {
        //总页数->数据总条数/每页显示的数据条数
        pages = Math.ceil(count/limit)
        //page范围
        page = Math.min(page, pages)
        page = Math.max(page, 1)    
        //忽略条数
        let skip = (page-1)*limit;
        User.find().limit(limit).skip(skip).then((users) => {
            res.render('admin/user_index',{
                userInfo: req.userInfo,
                url: '/admin/user',
                users,
                count,
                pages,
                page 
            })
        })
    })
})

/**
 * 分类管理 
 * 1.首页 /admin/category
 * 2.添加分类 /admin/category/add
 *     a.添加分类页面
 *     b.添加分类name提交
 * 3.删除分类 /category/delete
 */
router.get('/category', function(req, res, next){
    let page = Number(req.query.page || 1);
    const limit = 2;
    let pages = 0;
    Category.count().then((count) => {
        //总页数->数据总条数/每页显示的数据条数
        pages = Math.ceil(count/limit)
        //page范围
        page = Math.min(page, pages)
        page = Math.max(page, 1)    
        //忽略条数
        let skip = (page-1)*limit;
        Category.find().sort({_id: -1}).limit(limit).skip(skip).then((categories) => {
            res.render('admin/category_index',{
                userInfo: req.userInfo,
                url: '/admin/category',
                categories,
                count,
                pages,
                page,
                limit
            })
        })
    })
})
//添加分类页面
router.get('/category/add', (req, res, next) => {
    res.render('admin/category_add',{
        userInfo: req.userInfo
    })
})
//添加分类name提交
router.post('/category/add', (req, res, next) => {
    var name = req.body.name || '';
    if (name == '') {
        res.render('admin/error', {
            userInfo: req.userInfo,
            message: '名称不能为空',
            url: '/admin/category'
        });
        return;
    }
    Category.findOne({
        name: name
    }).then((category) => {
        if(category) {
            res.render('admin/error', {
                userInfo: req.userInfo,
                message: '分类已经存在',
                url: '/admin/category'
            });
            return Promise.reject();  //异步
        } else {
            return new Category({
                name: name
            }).save()
        }
    }).then((newCategory) => {
        res.render('admin/success',{
            userInfo: req.userInfo,
            message: '分类保存成功',
            url: '/admin/category'
        });
    })
})
//删除分类name
router.get('/category/delete', (req, res, next) => {
    let id = req.query.id || '';
    Category.remove({
        _id: id
    }).then(() => {
        res.render('admin/success', {
            userInfo: req.userInfo,
            message: '删除成功',
            url: '/admin/category'
        })
    })
})
//编辑分类name
router.get('/category/edit', (req, res, next) => {
    var id = req.query.id || '';
    Category.findById(id).then((category) => {
        if(!category) {
            res.render('admin/error', {
                userInfo: req.userInfo,
                message: '分类不存在',
                url: '/admin/category'
            });
        } else {
            res.render('admin/category_edit', {
                userInfo: req.userInfo,
                name: category.name
            })
        }
    })
})
//编辑分类name后提交
router.post('/category/edit',(req, res, next) => {
    var id = req.query.id || '';
    var name = req.body.name || '';
    Category.findById(id).then((category) => {
        if(!category) {
            res.render('admin/error', {
                userInfo: req.userInfo,
                message: '分类不存在',
                url: '/admin/category'
            });
            return Promise.reject();
        } else {
            //用户没有修改
            if (name == category.name) {
                res.render('admin/success', {
                    message: '编辑成功',
                    url: '/admin/category'
                })
                return Promise.reject();
            } else {
                //要修改的名称是否在数据库存在
                return Category.findOne({
                    _id: {$ne: id},
                    name: name
                })
            }
        }
    }).then((sameCategory) => {
        if(sameCategory) {
            res.render('admin/error',{
                userInfo: req.userInfo,
                message: '分类已经存在同名分类'
            });
            return Promise.reject();
        } else {
            return Category.update({
                _id: id
            }, {
                name: name
            })
        }
    }).then(() => {
        res.render('admin/success', {
            userInfo: req.userInfo,
            message: '编辑成功',
            url: '/admin/category'
        })
    })
})

/**
 * 内容管理
 * 1.内容首页 /admin/content
 * 2.添加内容 /admin/content/add
 * 3.删除内容 /admin/content/delete
 * 4.编辑内容 /admin/content/edit
 */
router.get('/content', function(req, res, next){
    var page = Number(req.query.page || 1)
    var limit = 2;
    var pages = 0;
    Content.count().then((count) => {
        pages = Math.ceil(count/limit);
        page = Math.max(1, page);
        page = Math.min(page, pages);
        let skip = (page-1)*limit;
        Content.find().sort({addTime: -1}).limit(limit).skip(skip).populate(['category', 'user']).then((contents) => {
            //console.log(contents);
            res.render('admin/content_index',{
                userInfo: req.userInfo,
                contents: contents,
                pages: pages,
                page: page,
                limit: limit,
                count: count,
                url: '/admin/content'
            })
        })
    })
        
})
router.get('/content/add', function (req, res, next) {
    Category.find().then((categories) => {
        res.render('admin/content_add', {
            userInfo: req.userInfo,
            categories: categories
        })
    })
})
/**
 * 数据保存时增加user当前登陆用户id:req.userInfo._id.toString()
 */
router.post('/content/add', function (req, res, next) {
    //console.log(req.body)
    if(req.body.title == '') {
        res.render('admin/error', {
            userInfo: req.userInfo,
            message: '分类标题不能为空'
        })
    } else {
        new Content({
            category: req.body.category,
            title: req.body.title,
            user: req.userInfo._id.toString(),
            description: req.body.description,
            content: req.body.content
        }).save().then(function(rs){
            res.render('admin/success',{
                userInfo: req.userInfo,
                message: '内容保存成功',
                url: '/admin/content'
            });
        })
    }
})
//内容编辑提交
/**
 * select选中
 */
//内容编辑路由
router.get('/content/edit', ( req, res, next ) => {
    var id = req.query.id || '';
    Content.findOne({
        _id: id
    }).populate('category').then((content) => {
        if(!content) {
            res.render('admin/error', {
                userInfo: req.userInfo,
                message: '内容不存在',
                url: '/admin/content' 
                });
        } else {
            Category.find().sort({_id: -1}).then((categories) => {
                //console.log(categories)
                res.render('admin/content_edit', {
                    userInfo: req.userInfo,
                    categories: categories,
                    content: content
                })
            })
        }
    })
})

router.post('/content/edit', (req, res, next) => {
    var id = req.query.id;
    var title = req.body.title || '';
    var description = req.body.description || '';
    var content = req.body.content || '';
    var category = req.body.category;
    if(req.body.title == '') {
        res.render('admin/error', {
            userInfo: req.userInfo,
            message: '分类标题不能为空'
        })
        return
    }
    Content.update({
        _id: id
    },{
        title: title,
        description: description,
        content: content,
        category: category
    }).then(function(){
        res.render('admin/success',{
            userInfo: req.userInfo,
            message: '内容编辑成功',
            url: '/admin/content'
        });
    })
})

router.get('/content/delete', function (req, res, next) {
    var id = req.query.id || '';
    Content.remove({
        _id : id
    }).then(function(){
        res.render('admin/success', {
            userInfo: req.userInfo,
            message: '删除成功',
            url: '/admin/content'
        })
    })
})
module.exports = router;