const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require('../../models/Category')
require('../../models/Post')
const Post = mongoose.model('posts')
const Category = mongoose.model('categories')

router.get('/', (req, res) => {
    Post.find().populate('category').sort({created_at: 'desc'})
        .then(
            (posts) => res.render('admin/posts/index', {posts: posts})
        )
        .catch(
            (err) => {
                req.flash('error_msg', 'Error! There is a problem to list posts.')
                res.render('admin/posts/index')
                console.log(err)
            }
        )
})

router.get('/create', (req, res) => {
    Category.find()
        .then(
            (categories) => res.render('admin/posts/create_update', {categories: categories})
        )
        .catch(
            (err) => {
                req.flash('error_msg', 'There is a error to load form.')
                req.redirect('/')
            }
        )
})

router.post('/add', (req, res) => {
    
    const newPost = {
        title: req.body.title,
        slug: req.body.slug,
        description: req.body.description,
        content: req.body.content,
        category: req.body.category
    }

    let errors = validate(newPost);

    if(errors.length > 0) {
        Category.find()
        .then(
            (categories) => res.render('admin/posts/create_update', {errors: errors, categories: categories})
        )
        .catch(
            (err) => {
                req.flash('error_msg', 'There is a error to load form.')
                req.redirect('/')
            }
        )
    } else {
        new Post(newPost)
            .save()
            .then(
                () => {
                    req.flash('success_msg', `Success! Post "${newPost.title}" created!`)
                    res.redirect('/admin/posts')
            })
            .catch(
                (err) => {
                    req.flash('error_msg', `Error! Post "${newPost.title}" wasn't created!`)
                    res.redirect('/admin/posts/create')
                    console.log(err)
                }
            )
    }
})

router.get('/edit/:id', (req, res) => {
    Post.findOne({_id: req.params.id})
        .populate('category')
        .then(
            (post) => {
                Category.find()
                    .then(
                        (categories) => res.render('admin/posts/create_update', {post: post, categories: categories})
                    )
                    .catch(
                        (err) => {
                            req.flash('error_msg', 'This is a error to list categories.')
                            res.redirect('/admin/posts')
                        }
                    )
            }
        )
        .catch(
            (err) => {
                req.flash('error_msg', 'This Post doesn\'t exist.')
                res.redirect('/admin/posts')
                console.log(err)
            }
        )
})

router.post('/update', (req, res) => {

    const updatePost = {
        _id: req.body.id,
        title: req.body.title,
        slug: req.body.slug,
        description: req.body.description,
        content: req.body.content,
        category: req.body.category,
        update_at: Date.now()
    }
    
    let errors = validate(updatePost);

    if(errors.length > 0) {
        res.render('admin/posts/create_update', {errors: errors})
    } else {

        Post.findOneAndUpdate(updatePost._id, {$set:updatePost})
            .then(
                () => {
                    req.flash('success_msg', `Success! Post "${updatePost.title}" updated!`)
                    res.redirect('/admin/posts')   
                }
            )
            .catch(
                (err) => {
                    req.flash('error_msg', `Error! Post "${Post.title}" wasn't created!`)
                    res.redirect('/admin/posts')
                    console.log(err)
                }
        ) 
    }
})

router.post("/delete", (req, res) => {

    Post.findByIdAndDelete({_id: req.body.id})
        .then(
            (Post) => {
                req.flash('success_msg', `Success! Post "${Post.title}" deleted!`)
                res.redirect('/admin/posts')
            }
        )
        .catch(
            (err) => {
                req.flash('error_msg', `Error! Post "${Post.title}" wasn't deleted!`)
                res.redirect('/admin/posts')
                console.log(err)
            }
        )
})

function validate(object) {
    let errors = [];

    if(!object.title || typeof object.title == undefined || object.title == null) {
        errors.push({text: 'Invalid title'})
    }

    if(object.title.length < 2) {
        errors.push({text: 'Post title too small'})
    }

    if(!object.slug || typeof object.slug == undefined || object.slug == null) {
        errors.push({text: 'Invalid slug'})
    }

    if(!object.description || typeof object.description == undefined || object.description == null) {
        errors.push({text: 'Invalid description'})
    }

    if(!object.content || typeof object.content == undefined || object.content == null) {
        errors.push({text: 'Invalid content'})
    }

    if(object.category == 0) {
        errors.push({text: 'Invalid category'})
    }

    return errors
}

module.exports = router