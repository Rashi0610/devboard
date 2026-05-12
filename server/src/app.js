import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import session from 'express-session'
import passport from 'passport'
import './config/passport.js'
import authRoutes from './routes/auth.routes.js'

const app = express()

// middleware first
app.use(helmet())
app.use(morgan('dev'))
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }))
app.use(express.json())
app.use(cookieParser())
app.use(session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: false }))
app.use(passport.initialize())
app.use(passport.session())

// routes after
app.use('/api/auth', authRoutes)
app.get('/api/health', (req, res) => res.json({ status: 'ok', project: 'Shipyard 🚢' }))

export default app