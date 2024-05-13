var express = require('express');
var router = express.Router();
const useModel = require('./users');
const passport = require('passport');
const localStretagy = require('passport-local');
// const { removeAllListeners } = require('nodemon');
const postModule = require('./posts')
const upload = require('./multer')

passport.use(new localStretagy(useModel.authenticate()));

/* GET home page. */
router.get('/', function (req, res, next) {
  // console.log(req.flash("error"))
  res.render('index', { error: req.flash('error') });
});
router.get('/register', function (req, res, next) {
  res.render('register');
});

router.get('/home', isloggedIn, async function (req, res, next) {
  const posts = await postModule.find().populate('user');
  res.render('home',{posts});
});

router.get('/search', isloggedIn,async function (req, res, next) {
  const posts = await postModule.find().populate('user');
  res.render('search', {posts});
});

router.get('/profile', isloggedIn, async function (req, res, next) {
  const user = await useModel.findOne({
    username: req.session.passport.user
  }).populate('posts')
  res.render("profile", { user });
});


router.get('/notification', isloggedIn, async function (req, res, next) {
  const posts = await postModule.find().populate('user');
  res.render('notification',{posts});
});


router.get('/username/:username', isloggedIn, async function (req, res, next) {
  const regex  = new RegExp(`^${req.params.username}`,'i');
  const user = await useModel.find({username:regex})
  res.json(user);
});


router.post('/uploadForm', isloggedIn, upload.single("file"), async function (req, res, next) {
  const user = await useModel.findOne({ username: req.session.passport.user })
  user.profileimage = req.file.filename;
  await user.save();
  res.redirect('/profile');
});


router.post('/uploadPost',  isloggedIn, upload.single("file"), async function (req, res, next) {
  try {
    const user = await useModel.findOne({ username: req.session.passport.user });

    // Check if the user exists
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const post = await postModule.create({
      image: req.file.filename,
      user: req.user._id,
      text: req.body.caption
    });

    // Push the newly created post's ID to the user's posts array
    user.posts.push(post._id);
    
    // Save the user with the updated posts array
    await user.save();

    // Redirect to the home page after successful upload
    res.redirect("/home");
  } 

  catch (error) {
    // Handle any errors that occur during the process
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});



router.post("/now-register", async function (req, res) {
  const userdata = await useModel({
    username: req.body.username,
    password: req.body.password,
    email: req.body.email,
  })

  useModel.register(userdata, req.body.password)
    .then(function (registereduser) {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/")
      })
    })
})


router.post('/login', passport.authenticate('local', {
  successRedirect: '/profile',
  failureRedirect: '/',
  failureFlash: true,
}), function (req, res) { });

function isloggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/")
}

router.get('/logout', function (req, res, next) {
  req.session.destroy((err) => {
    if (err) {
      console.log(err)
    }
    else {
      res.redirect('/')
    }
  })
});




// to create posts

// router.get('/allposts',async function(req,res,next){

//     res.send(user)
// })

// router.get('/usercreate',async function(req,res,next){
// let createduser = await useModel({
//   username:"Aitya",
//   email:"aditya@123",
// })
// res.send(createduser);
// });

// router.get('/createpost', async function (req, res,next) {
//   let createpost = await postModule({
//     user: '65c8a50a93846a402543a630',
//     text:"hello! everyone I'm sumit malviya",
//   });

//   let user = await useModel.findOne({_id : '65c8a50a93846a402543a630'});
//   user.posts.push(createpost._id);
//   await user.save();
//   res.send('done')
// })


// router.post('/upload',upload.single('file'), (req,res) =>{
//   if(!req.file) {
//     return res.status(500).send('No files were uploaded.')
//   }
//   res.send('file uploaded successfully!');
// })


module.exports = router;
