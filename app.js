// loading modules
    const express = require('express')
    const handlebars = require('express-handlebars')
    //const handlebars_dateformat = require('handlebars-dateformat')
    const bodyParser = require('body-parser')
    const app = express()
    const admins = require('./routers/admins/home')
    const admins_categories = require('./routers/admins/categories')
    const admins_posts = require('./routers/admins/posts')
    const users = require('./routers/users')
    const path = require('path')
    const mongoose = require('mongoose')
    const session = require('express-session')
    const flash = require('connect-flash')
    const bcrypt = require('bcryptjs')

    //require('./models/User')
    require('./models/Post')
    require('./models/Category')
    //const User = mongoose.model('users')
    const Post = mongoose.model('posts')
    const Category = mongoose.model('categories')

// Configurations
    // Session
        app.use(session({secret: 'blog', resave: true, saveUninitialized: true}))
        app.use(flash())
    // Middleware
        app.use((req, res, next) => {
            res.locals.success_msg = req.flash("success_msg")
            res.locals.error_msg = req.flash("error_msg")
            next()
        })
    // Body Parser
        app.use(bodyParser.urlencoded({extended: true}))
        app.use(bodyParser.json())
    // Handlebars
        app.engine('handlebars', handlebars({defaultLayout: 'main'}))
        app.set('view engine', 'handlebars')
        app.set('views', path.join(__dirname, 'views'))

    // Mongoose
        mongoose.Promise = global.Promise;
        mongoose.connect('mongodb://localhost/blog', { useNewUrlParser: true })
        .then(
            () => console.log('Connected to the MongoDB!')
        )
        .catch(
            (err) => console.log('Error connecting: ' + err)
        )
    // Public
        app.use(express.static(path.join(__dirname, 'public')))

// Routers
    app.get('/', (req, res) => {
        Post.find().populate('category').sort({created_at: 'desc'})
            .then(
                (posts) => res.render('index', {posts: posts})
            ).catch(
                (err) => {
                    req.flash('error_msg', 'There is a internal error')
                    res.redirect('/404')
                    console.log(err)
                }
            )
    })

    app.get('/posts/:slug', (req, res) => {
        Post.findOne({slug: req.params.slug})
            .then((post) => {                
                if(post) {                    
                    res.render('posts/index', {post: post})
                } else {
                    req.flash('error_msg', 'This post not exist!')
                    res.redirect('/')
                }
            }).catch(
                (err) => {
                    req.flash('error_msg', 'There is a internal error')
                    res.redirect('/')
                    console.log(err)
                }
            )
    })

    app.get('/categories', (req, res) => {
        Category.find()
            .then(
                (categories) => res.render('categories/index', {categories: categories})
            ).catch(
                (err) => {
                    req.flash('error_msg', 'There is a internal error to list categories')
                    res.redirect('/')
                    console.log(err)
                }
            )
    })

    app.get('/categories/:slug', (req, res) => {
        Category.findOne({slug: req.params.slug})
            .then((category) => {
                if(category) {
                    Post.find({category: category._id})
                    .then(
                        (posts) => res.render('categories/posts', {posts: posts, category: category})
                    )
                    .catch(
                        (err) => {
                            req.flash('error_msg', 'There is a error to list posts!')
                            res.redirect('/')
                        }
                    )
                } else {
                    req.flash('error_msg', 'This category not exist!')
                    res.redirect('/')
                }                 
            }).catch(
                (err) => {
                    req.flash('error_msg', 'There is a internal error to load category\'s page.')
                    res.redirect('/')
                    console.log(err)
                }
            )
    })

    app.get('/', (req, res) => res.render('error'))
    app.use('/admins', admins)
    app.use('/admins/categories', admins_categories)
    app.use('/admins/posts', admins_posts)
    app.use('/users', users)

// Others
    const PORT = 8081
    app.listen(PORT, 
        () => console.log('Server running...\n\nhttp://localhost:8081')
    )