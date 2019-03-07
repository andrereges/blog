const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require('../../models/Category')
const Category = mongoose.model('categories')

router.get('/', (req, res) => {
    Category.find()
        .sort({created_at: 'desc'})
        .then(
            (categories) => res.render('admins/categories/index', { categories: categories})
        )
        .catch(
            (err) => {
                req.flash('error_msg', 'Error! There is a problem to list categories.')
                res.render('admins/categories/index')
                console.log(err)
            }
        )
})

router.get('/create', (req, res) => res.render('admins/categories/create_update'))

router.post('/add', (req, res) => {
    
    const newCategory = {
        name: req.body.name,
        slug: req.body.slug
    }

    let errors = validate(newCategory);

    if(errors.length > 0) {
        res.render('admins/categories/create_update', {errors: errors})
    } else {
        new Category(newCategory)
            .save()
            .then(
                (category) => {
                    req.flash('success_msg', `Success! Category "${category.name}" created!`)
                    res.redirect('/admins/categories')
            })
            .catch(
                (err) => {
                    req.flash('error_msg', `Error! Category "${category.name}" wasn't created!`)
                    res.redirect('/admins/categories/create')
                    console.log(err)
                }
            )
    }
})

router.get('/edit/:id', (req, res) => {
    Category.findOne({_id: req.params.id})
        .then(
            (category) => res.render('admins/categories/create_update', {category: category})
        )
        .catch(
            (err) => {
                req.flash('error_msg', 'This category doesn\'t exist.')
                res.redirect('/admins/categories')
                console.log(err)
            }
        )
})

router.post('/update', (req, res) => {

    const updateCategory = {
        _id: req.body.id,
        name: req.body.name,
        slug: req.body.slug,
        update_at: Date.now()
    }

    let errors = validate(updateCategory);

    if(errors.length > 0) {
        res.render('admins/categories/create_update', {errors: errors})
    } else {

        Category.findOneAndUpdate(updateCategory._id, {$set:updateCategory})
            .then(
                () => {
                    req.flash('success_msg', `Success! Category "${updateCategory.name}" updated!`)
                    res.redirect('/admins/categories')   
                }
            )
            .catch(
                (err) => {
                    req.flash('error_msg', `Error! Category "${category.name}" wasn't created!`)
                    res.redirect('/admins/categories/update')
                    console.log(err)
                }
        )
            } 
})

router.post("/delete", (req, res) => {

    Category.findByIdAndDelete({_id: req.body.id})
        .then(
            (category) => {
                req.flash('success_msg', `Success! Category "${category.name}" deleted!`)
                res.redirect('/admins/categories')
            }
        )
        .catch(
            (err) => {
                req.flash('error_msg', `Error! Category "${category.name}" wasn't deleted!`)
                res.redirect('/admins/categories')
                console.log(err)
            }
        )
})

function validate(object) {
    let errors = [];

    if(!object.name || typeof object.name == undefined || object.name == null) {
        errors.push({text: 'Invalid name'})
    }

    if(!object.slug || typeof object.slug == undefined || object.slug == null) {
        errors.push({text: 'Invalid slug'})
    }

    return errors
}

module.exports = router