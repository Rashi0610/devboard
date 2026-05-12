import { Router } from "express";
import passport from "passport";
const router = Router();
import { generateTokens,setTokenCookies } from "../services/auth.service.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import UserModel from '../models/User.model.js'

router.get("/github",passport.authenticate('github',{scope:['user:email']}))

router.get('/github/callback',
  passport.authenticate('github', { failureRedirect: `${process.env.CLIENT_URL}/login` }),
  (req, res) => {
    const { accessToken, refreshToken } = generateTokens(req.user)
    setTokenCookies(res, accessToken, refreshToken)
    res.redirect(process.env.CLIENT_URL)  // success → go to dashboard
  }
)

router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await UserModel.findById(req.userId)
    if(!user) return res.status(404).json({ message: 'User not found' })
    res.json({ user })
  } catch(err) {
    res.status(500).json({ message: 'Server error' })
  }
})

router.get('/logout', function(req, res, next) {
 
  req.logout(function(err) {
    if (err) { 
      return next(err); 
    }
    res.json({ success: true });
  });
});


export default router;