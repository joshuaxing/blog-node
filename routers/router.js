const express = require('express');
const router = express.Router();
const Category = require('../models/Category')
const Content = require('../models/Content')
let data = {}
router.use(function(req, res, next){
    data = {
        userInfo: req.userInfo,
        categories: [],
        category: req.query.category || ''
    }
    Category.find().then((categories) => {
        data.categories = categories;
    })
    next();
})
router.get('/', (req, res, next) => {
    data.page = Number(req.query.page || 1);
    data.pages = 0;
    data.limit = 2;
    data.count = 0;
    let where = {};
    if(data.category) {
        where.category = data.category
    }
    Content.where(where).count().then((count) => {
        data.count = count;
        data.pages = Math.ceil(count/data.limit);
        data.page = Math.min(data.page, data.pages);
        data.page = Math.max(data.page, 1);
        let skip = (data.page -1)*data.limit;
        return Content.where(where).find().limit(data.limit).skip(skip).sort({_id:-1}).populate(['category','user'])
    }).then((contents) => {
        data.contents = contents
        //console.log(data)
        res.render('main/index',data);
    })
})
router.get('/view', (req, res, next) => {
    var contentid = req.query.contentid || '';
    Content.findOne({
        _id: contentid
    }).populate(['category','user']).then((content) => {
        content.views++;
        content.save();
        data.content = content;
        //console.log(data)
        res.render('main/view', data)
    })
})
module.exports = router;