// loading modules
    const express = require('express')
    const handlebars = require('express-handlebars')
    //const handlebars_dateformat = require('handlebars-dateformat')
    const bodyParser = require('body-parser')
    const app = express()
    const admin = require('./routers/admin/home')
    const admin_categories = require('./routers/admin/categories')
    const admin_posts = require('./routers/admin/posts')
    const path = require('path')
    const mongoose = require('mongoose')
    const session = require('express-session')
    const flash = require('connect-flash')

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
    app.get('/', (req, res) => res.render('index'))
    app.use('/admin', admin)
    app.use('/admin/categories', admin_categories)
    app.use('/admin/posts', admin_posts)

// Others
    const PORT = 8081
    app.listen(PORT, 
        () => console.log('Server running...\n\nhttp://localhost:8081')
    )