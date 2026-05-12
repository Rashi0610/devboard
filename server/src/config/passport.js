import passport from "passport";
import UserModel from "../models/User.model.js";
import { Strategy as GitHubStratergy } from "passport-github2";

passport.use(new GitHubStratergy({
    clientID:process.env.GITHUB_CLIENT_ID,
    clientSecret:process.env.GITHUB_CLIENT_SECRET,
    callbackURL:process.env.GITHUB_CALLBACK_URL
},(async (accessToken, refreshToken, profile, done) => {
   try {
    const existingUser = await UserModel.findOne({github_id:profile.id});
    if(!existingUser){
       const user = await UserModel.create({
        name: profile.displayName,
        github_id:profile.id,
        email:profile.emails?.[0]?.value,
        avatar_url:profile.photos[0].value,
        github_access_token:accessToken
       })
       return done(null, user)
    }
    else{
  return done(null, existingUser)
}
}

    catch(err){
        done(err)
    }
})));

passport.serializeUser((user,done)=>{
    done(null,user.id)
})
passport.deserializeUser(async(id,done)=>{
    try{
        const user = await UserModel.findById(id);
        done(null,user);
    }
    catch(err){
        done(err);
    }
})



