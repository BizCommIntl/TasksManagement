import dotenv from "dotenv";
dotenv.config();
import express from "express";
import bodyParser from "body-parser";
import { checkAuthentication } from "./views/google_oauth.js";
import _ from "lodash";
import passport from 'passport';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import GoogleStrategy from 'passport-google-oauth2';
import mongodbConnection from "./database/db.js";
// import { MainFormate } from "./database/models/newList.js";
import RecTask from "./database/models/Task.js";

const app = express();

const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static("public"));

app.set('view engine', 'hbs');

// global varibale for user
var userInfoVariable;

// getting environment variables
const clientID = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const callbackURL = process.env.CALLBACK_URL;

//  Passport.js for Google sign in
passport.use(new GoogleStrategy.Strategy({
    clientID,
    clientSecret,
    callbackURL,
    passReqToCallback: true,
}, (request, accessToken, refreshToken, profile, done) => {

    userInfoVariable = profile;
    return done(null, profile);

}));

// session setup
app.use(session({
    secret: '?3Yq7v+m6>Bht',
    resave: false,
    saveUninitialized: true,
}));

app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());

// passport setup
passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

// Mongo DB connection!
mongodbConnection();


// SIGN IN ROUTES OF GOOGLE
app.get('/auth/google', passport.authenticate('google', {
    scope: ['email', 'profile'],
}));

app.get("/sign/in", checkAuthentication, (req, res) => {
    res.redirect("/auth/google/success");
})

app.get('/auth/google/callback', passport.authenticate('google', {
    successRedirect: '/auth/google/success',
    failureRedirect: '/auth/google/failure',
}));

app.get('/auth/google/success', (req, res) => {

    // create a session state named userDetail containg all info of userInfoVariable
    req.session.userDetail = userInfoVariable;

    res.redirect("/");
});

app.get('/auth/google/failure', (req, res) => {
    res.send("Welcome to failure page");
});


app.get('/service', async (req, res) => {
    //console.log('req.session.userDetail: \n',req.session.userDetail)
    try {    
        // const tempRec = await MainFormate.find({});
        const tempRec = await RecTask.find({});
        // console.log('DB status:',tempRec);
    
        res.render("service.hbs", {
            TasksData: tempRec
            });
    
  }
      catch (e) {
        console.log('DB reply-',"ERROR:> " + e);
         res.status(400).send(e);
      }
});


app.post("/TaskAddNew", async (req, res) => {

    // get data from session state
    const userDetail = req.session.userDetail;

    // const createItem = _.capitalize(req.body.newList);
    // const createDate = req.body.date;
    // const createTime = req.body.time;

    // get full document from DB having a unique user id and a listTitle
    // check if user have no listTitle in document 


    console.log('POST req.body status: ',req.body);
    if (req.body.ID==='' || req.body.Title===''){
        console.log('Invalid/Empty Entry' );
        // res.status(400).send(e);
        res.redirect("/service");
    }
    else if (req.body._id){
        //REPLACE old record
        try {
            //const tempRec = await RecTask.find({});
            // const tempRec = await recStaff.findByIdAndUpdate(req.params.id, req.body)
            const tempRec = await RecTask.findByIdAndUpdate(req.body._id, req.body)
            // console.log('Rec Replaced = ', tempRec)
        
            //console.log('DB status:', tempRec);
            // res.send(tempRec);
            res.redirect("/service");
        }
        catch (e) {
            console.log('DB reply-', "ERROR:> " + e);
            res.status(400).send(e);
        }
    }

    else    {
        //ADD NEW Rec
        try {
            const task = new RecTask({
                ID: req.body.ID,
                Title: req.body.Title,
                Status:req.body.Status
            });
    
            await task.save();
            console.log('Rec Saved = ', task)
    
            // const tempRec = await RecTask.find({});
            //console.log('DB status:', tempRec);
            // res.send(tempRec);
            res.redirect("/service");
        }
        catch (e) {
            console.log('DB reply-', "ERROR:> " + e);
            res.status(400).send(e);
        }
    
    }
})


app.post("/TaskDelete", async (req, res) => {
    try {
        //const id = req.params.id;
        const rec = await RecTask.findOneAndDelete({ _id: req.body._id });
        // console.log('Rec Deleted = ', rec)

        res.status(201).send(rec);
    
        //console.log('DB status:', tempRec);
        // res.send(tempRec);

        // const tempRec = await RecTask.find({});
        // res.render("service.hbs", {
        //     TasksData: tempRec
        //     });


        // res.redirect("/service?username=jhadd24");
        // res.redirect('/');

    }
    catch (e) {
        console.log('DB reply-', "ERROR:> " + e);
        res.status(400).send(e);
    }
})


// ==============================================================
//-----------[        Data GET - All Records        ]
// ==============================================================
// router.get('/DB-Rec', async (req, res) => {
//   console.log("get request");

//   try {
//     const tempRec = await recUser.find({});
//     console.log(tempRec);

//     res.send(tempRec);
//   }
//   catch (e) {
//     console.log("ERROR" + e);
//     res.status(400).send(e);
//   }
// });


app.get("/ManualEntry", async (req, res) => {
    //console.log('req.session.userDetail: \n',req.session.userDetail)
    try {
        const task = new RecTask({
            // ID: Number(103),
            ID: 103,
            Title: '3rd Dummy Entry'
        });

        await task.save();
        // res.redirect("/");


        // const tempRec = await MainFormate.find({});
        const tempRec = await RecTask.find({});
        console.log('DB status:', tempRec);

        res.send(tempRec);
    }
    catch (e) {
        console.log('DB reply-', "ERROR:> " + e);
        res.status(400).send(e);
    }
})

app.get("/SimpleWorking", async (req, res) => {
    //console.log('req.session.userDetail: \n',req.session.userDetail)
        res.render("home.hbs")
})

app.get("/", async (req, res) => {
    console.log('req.session.userDetail: \n',req.session.userDetail)
    const userDetail = req.session.userDetail;

    const timeElapsed = Date.now();
    const today = new Date(timeElapsed);
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dayName = daysOfWeek[new Date().getDay()];
    const time = (today.getHours() > 9 ? today.getHours() > 12 ? today.getHours() - 12 : today.getHours() : "0" + today.getHours()) + " : " + (today.getMinutes() > 9 ? today.getMinutes() : "0" + today.getMinutes());


    if (userDetail !== null && userDetail !== undefined && typeof userDetail === 'object') {

        // res.render("home.hbs")
        res.render("home.hbs", {
            userDetail:userDetail,
            userName:userDetail.displayName,
            userEmail:userDetail.email,
            userPic:userDetail.PhotoURL

            // sub: '101299453244032604290',
            // id: '101299453244032604290',
            // displayName: 'Mufakhar',
            // given_name: 'Mufakhar',
            // email: 'bizappsintl@gmail.com',
            // picture: 'https://lh3.googleusercontent.com/a/ACg8ocIr2e3EylbP1vgmvNzOg6Bihe-QOJleTDyBeQOidOZk=s96-c',
          
        })
    }
        else {
            // res.send("EEEEERRRRRRRRRRRRRRRRRRRRRRRRROOOOOOOOOOOOOORRRRRRRRRRRRRrrrr/sign/in");
            res.redirect("/sign/in");
        }
    
})


// to stop request went through this route
app.get("/favicon.ico", (req, res) => {
    res.status(204).end();
});




app.listen(port, () => {
    console.log(`Server is running on ${port}`);
})




