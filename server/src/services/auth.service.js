import jwt from 'jsonwebtoken'

export const generateTokens = (user) =>{
    const accessToken = jwt.sign(
  { userId: user._id },       
  process.env.JWT_SECRET,              
  { expiresIn: '15m' }        
)

    const refreshToken = jwt.sign(
  { userId: user._id },        
  process.env.JWT_REFRESH_SECRET,              
  { expiresIn: '7d' }        
)

 return { accessToken, refreshToken };
}



export const setTokenCookies = (res, accessToken, refreshToken) => {
    res.cookie('accessToken', accessToken, {
    httpOnly: true, 
    secure: true,
    sameSite: 'none', 
    maxAge: 15 * 60 * 1000 
  })
  res.cookie('refreshToken', refreshToken, {
   httpOnly: true, 
   secure: true, 
   sameSite: 'none', 
   maxAge: 7 * 24 * 60 * 60 * 1000 
  })
  res.cookie('socketToken', accessToken, {
  httpOnly: false,        // ← readable by JS, needed for socket auth
  secure: true,
  sameSite: 'none',
  maxAge: 15 * 60 * 1000
})
}