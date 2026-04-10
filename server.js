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

try {
    await client.connect()
    console.log("The connection to Redis has been successful!")
} catch (error) {
    console.error("Could not establish Redis connection!", error.message)
}

app.post("/post", limiter, async (req, res) => {
    try {

    const { title, content, category, tags } = req.body

    const result = await pool.query(
        `INSERT INTO posts (title, content, category, tags)
        VALUES ($1, $2, $3, $4)
        RETURNING *;`,
        [title, content, category, tags]
    )

    await client.del("posts:all")

    res.status(201).json(result.rows[0])

} catch (error) {
    console.error("Could not post data!", error.message)
    res.status(500).json({ error: error.message})
}})

app.get("/get/all", limiter, async (req, res) => {
    
    const redis_cache = await client.get("posts:all")

    if (redis_cache) {
        console.log(`Fetching all the data from the cache...`)
        return res.json(JSON.parse(redis_cache))
    }

    console.log("Fetching data from the database...")

    const result = await pool.query(
        `SELECT * FROM posts`
    )

    await client.setEx("posts:all", 1800, JSON.stringify(result.rows))

    res.json(result.rows)

})