var bodyParser = require("body-parser"),
    methodOverride = require("method-override"),
    expressSanitizer = require("express-sanitizer"),
	express    = require("express"),
	app        = express(),
	Blog	   = require('./models/blog'),
	mongoose   = require("mongoose"),
	passport   = require("passport"),
	localStratagy = require("passport-local"),
	passportLocalMongoose = require("passport-local-mongoose"),
	User 				  = require("./models/user");


//Numerical-CONFIG
var port = 3000;
var host_name = "localhost";
mongoose.connect("mongodb://localhost/blog_app", { useNewUrlParser : true});
//APP-CONFIG
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended : true}));
app.use(methodOverride("_method"));
app.use(expressSanitizer());


//Passport config

app.use(require("express-session")({
	secret : "Shailaja said no for going date with me f boys",
	resave : false,
	saveUninitialized : false
}));




app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.urlencoded({ extended : true }));

passport.use(new localStratagy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next) {
	res.locals.currentUser = req.user;
	next();
});

//=========================================


//Auth routes

//register route
app.get("/register", (req, res) => {
	res.render("register");
});

app.post("/register", (req, res)=>{

	User.register(new User({username : req.body.username}), req.body.password, (err, user) => {
		if(err) {
			console.log(err);
			return res.render("register");
		}
		passport.authenticate("local")(req, res, () => {
			res.redirect("/blogs");
		});

	});

});


//login routes
app.get("/login",(req,res) => {
	res.render("login");
});

app.post("/login", passport.authenticate("local", {				
	successRedirect : "/blogs",
	failureRedirect : "/login"
}), (req, res) => {

});

//logout routes
app.get("/logout", (req, res) => {
	req.logout();
	res.redirect("/");
});


//=====================================================
//RESTful ROUTES

app.get("/", (req, res) => {
	res.redirect("/blogs");
});

//INDEX Routes
app.get("/blogs", (req, res) => {
	Blog.find({}, (err, blogs) => {
			if(err) {
				console.log(err);
			}else {
				res.render("index", {blogs: blogs});
			}
	});
	
});

//NEW route
app.get("/blogs/new", isLoggedIn,(req, res) => {
		res.render("new");
});

//CREATE route
app.post("/blogs", (req, res) =>{
			//Create a new blog 
			//redirect to index page
			req.body.blog.body = req.sanitize(req.body.blog.body);
			Blog.create(req.body.blog,(err, newblog)=> {
					if(err) {
						res.redirect("/blogs/new");
					}else {
						res.redirect("/blogs");
					}
			});
});

//SHOW route
app.get("/blogs/:id", (req, res) => {
		Blog.findById(req.params.id, (err, foundBlog) => {
				if(err) {
					res.redirect("/blogs");
				}else{
						res.render("show", {blog : foundBlog});
				}
		});
	
});

//EDIT route
app.get("/blogs/:id/edit",isLoggedIn,(req, res) => {
		Blog.findById(req.params.id, (err, foundBlog) => {
			if(err) {
				res.redirect("/blogs");
			}else {
				res.render("edit",{blog:foundBlog});
			}
		})
		
});

//UPDATE route
app.put("/blogs/:id", (req, res) => {
	req.body.blog.body = req.sanitize(req.body.blog.body);
	Blog.findByIdAndUpdate(req.params.id, req.body.blog, (err, newblog) => {
			if(err) {
				res.redirect("/blogs");
			}else {
				res.redirect("/blogs/"+req.params.id);
			}
	});
});

//DELETE route
app.delete("/blogs/:id", (req, res) => {
		Blog.findByIdAndRemove(req.params.id, (err) => {
			if(err) {
				res.redirect("/blogs");
			}else {
				res.redirect("/blogs");
			}
		});
});


app.listen(port, host_name, () => {
		console.log(`The blog server started at http://${host_name}:${port}`);
});


//middleware to check if it is authenticated
function isLoggedIn(req, res, next) {
	if(req.isAuthenticated()) {
		return next();
	}
	res.redirect("/login");
}




 /////////////////////////


// import matplotlib.pyplot as plt
// import numpy as np

// objects = ['Positive', 'Negative']
// y_pos = np.arange(len(objects))

// plt.bar(y_pos, [total_pos, total_neg], alpha = 0.5)
// plt.xticks(y_pos, objects)
// plt.ylabel("number")
// plt.title("number of positive and negative tweets")

// plt.show()



 /////////////////////////////