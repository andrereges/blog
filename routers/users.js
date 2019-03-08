const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require('../models/User')
const User = mongoose.model('users')
const bcrypt = require('bcryptjs')

router.get('/', (req, res) => {
    User.find().sort({created_at: 'desc'})
        .then(
            (users) => res.render('users/index', {users: users})
        )
        .catch(
            (err) => {
                req.flash('error_msg', 'Error! There is a problem to list users.')
                res.render('users/index')
                console.log(err)
            }
        )
})

router.get('/create', (req, res) => {
     res.render('users/create_update')
})

router.post('/add', (req, res) => {
    
    const newUser = {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword
    }

    let errors = validate(newUser);

    if(errors.length > 0) {
        res.render('users/create_update', {errors: errors})
    } else {

        delete newUser.confirmPassword;

        User.findOne({email: newUser.email})
            .then(
                (user) => {
                    if(user) {
                        req.flash('error_msg', 'An account with this email already exists on the system.')
                        res.redirect('/users/create')
                    } else {
                        bcrypt.genSalt(10, (error, salt) => {
                            bcrypt.hash(newUser.password, salt, (error, hash) => {
                                if(error) {
                                    req.flash('error_msg', `Error! There is an error to save user!`)
                                    res.redirect('/users/create')
                                } else {
                                    newUser.password = hash
                        
                                    new User(newUser)
                                        .save()
                                        .then(
                                            () => {
                                                req.flash('success_msg', `Success! User "${newUser.name}" created!`)
                                                res.redirect('/users/create')
                                        })
                                        .catch(
                                            (err) => {
                                                req.flash('error_msg', `Error! User "${newUser.name}" wasn't created!`)
                                                res.redirect('/users/create')
                                                console.log(err)
                                            }
                                        )
                                }
                            })
                        })
                    }
            })
            .catch(
                (err) => {
                    req.flash('error_msg', `Error! There is an internal error.`)
                    res.redirect('/users/create')
                    console.log(err)
                }
            )
    }
})

router.get('/edit/:id', (req, res) => {
    User.findOne({_id: req.params.id})
        .then(
            (user) =>  res.render('users/create_update', {user: user})
        )
        .catch(
            (err) => {
                req.flash('error_msg', 'This User doesn\'t exist.')
                res.redirect('/users')
                console.log(err)
            }
        )
})

router.post('/update', (req, res) => {

    const updateUser = {
        _id: req.body.id,
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        update_at: Date.now()
    }
    
    let errors = validate(updateUser);

    if(errors.length > 0) {
        res.render('users/create_update', {errors: errors})
    } else {

        delete updateUser.confirmPassword;

        User.findOneAndUpdate(updateUser._id, {$set:updateUser})
            .then(
                () => {
                    req.flash('success_msg', `Success! User "${updateUser.name}" updated!`)
                    res.redirect('/users')   
                }
            )
            .catch(
                (err) => {
                    req.flash('error_msg', `Error! User "${updateUser.name}" wasn't created!`)
                    res.redirect('/users')
                    console.log(err)
                }
        ) 
    }
})

router.post("/delete", (req, res) => {

    User.findByIdAndDelete({_id: req.body.id})
        .then(
            (User) => {
                req.flash('success_msg', `Success! User "${User.name}" deleted!`)
                res.redirect('/users')
            }
        )
        .catch(
            (err) => {
                req.flash('error_msg', `Error! User "${User.name}" wasn't deleted!`)
                res.redirect('/users')
                console.log(err)
            }
        )
})

function validate(object) {
    let errors = [];

    if(!object.name || typeof object.name == undefined || object.name == null) {
        errors.push({text: 'Invalid name'})
    }

    if(!object.email || typeof object.email == undefined || object.email == null) {
        errors.push({text: 'Invalid email'})
    }

    if(!object.password || typeof object.password == undefined || object.password == null) {
        errors.push({text: 'Invalid password'})
    }

    if(!object.confirmPassword || typeof object.confirmPassword == undefined || object.confirmPassword == null) {
        errors.push({text: 'Invalid confirm password'})
    }

    if(object.password.length < 3) {
        errors.push({text: 'Password must be longer than 3 characters.'})
    }

    if(object.confirmPassword.length < 3) {
        errors.push({text: 'Confirm password must be longer than 3 characters.'})
    }

    if(object.password != object.confirmPassword) {
        errors.push({text: 'The passwords are different, try again!'})
    }


    return errors
}

module.exports = router