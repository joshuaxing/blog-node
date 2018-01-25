/**
 * 关联字段
 *  {
 *      //类型
 *      type: mongoose.Schema.Types.ObjectId
 *      //引用mongoose.model()
 *      ref: 
 *  }
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
module.exports = new Schema({
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    addTime: {
        type: Date,
        default: new Date()
    },
    views: {
        type: Number,
        default: 0
    },
    title: String,
    description: {
        type: String,
        default: ''
    },
    content: {
        type: String,
        default: ''
    },
    comments: {
        type: Array,
        default: []
    }
})