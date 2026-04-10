import express from "express"
import { createClient } from "redis"
import dotenv from "dotenv"
import pg from "pg"
import rateLimit from "express-rate-limit"
const { Pool } = pg

dotenv.config()

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
})

const app = express()
app.use(express.json())
const PORT = 3000

const limiter = rateLimit({
    max: 10,
    windowMs: 20 * 60 * 1000,
    message: "Requests overloaded! Please wait 20 minutes."
})

const client = createClient({
    url: process.env.REDIS_URL
})