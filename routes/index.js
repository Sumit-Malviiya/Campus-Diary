var express = require('express');
var router = express.Router();
const useModel = require('./users');
const passport = require('passport');
const localStretagy = require('passport-local');
// const { removeAllListeners } = require('nodemon');
const postModule = require('./posts')
const upload = require('./multer')
const path = require('path')
const chatModel = require('./chat')

passport.use(new localStretagy(useModel.authenticate()));

/* GET home page. */
router.get('/', function (req, res, next) {
  // console.log(req.flash("error"))
  res.render('index', { error: req.flash('error') });
});


router.get('/register', function (req, res, next) {
  res.render('register');
});

router.post('/userProfile',async function (req, res, next) {
  const user = await useModel.findOne({userKaName:req.username}).populate('posts')
  res.redirect('/userProfile')
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


router.get('/message',isloggedIn,async function (req, res, next) {
  const user = await useModel.findOne({
    username: req.session.passport.user
  }).populate('posts');

  const userall = await useModel.find({user:{ $nin:[req.session.passport.user] }});
  res.render('message',{user,userall});
});


router.get('/username/:username', isloggedIn, async function (req, res, next) {
  const regex  = new RegExp(`^${req.params.username}`,'i');
  const user = await useModel.find({username:regex}).populate('posts').exec();
  const userP= user[0];
  // console.log(user)
  // console.log(userP)
  router.get('/userProfile',async function (req, res, next) {
    res.render('userProfile',{userP,user});
  });
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



router.post('/saveChat', async (req, res, next) => {
  try {
      const { sender_id, receiver_id, message } = req.body;

      if (!sender_id || !receiver_id || !message) {
          return res.status(400).json({ success: false, msg: 'All fields are required' });
      }

      const chat = new chatModel({
          sender_id: sender_id,
          receiver_id: receiver_id,
          message: message
      });

      await chat.save();
      res.status(200).json({ success: true, msg: 'Chat Saved' });
  } catch (error) {
      res.status(400).json({ success: false, msg: error.message });
  }
});

module.exports = router;
