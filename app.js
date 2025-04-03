import express from 'express'
import { config } from 'dotenv'
import path from 'path'
config({path: path.resolve('./config/.env')})
import {initiateApp} from './src/utilities/initiateApp.js'
import { cleanupExpiredDesignsCron } from './src/utilities/corn.js'

const app = express()
initiateApp(app,express)


cleanupExpiredDesignsCron()

// TODO STRIPE CURRENCY -> USD - SAR - AED    (✔️)
// TODO Blogs AR,EN          hosni            (✔️)
// TODO Update User                           (✔️)

// TODO add admin account and make auth middleware 👀... (✔️)
// TODO "ENOENT: no such file or directory, open 'logo.png'" (✔️)
// TODO generate-image has problem (✔️)

// TODO Send Email service 
