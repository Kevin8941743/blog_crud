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
app.set("trust proxy", 1)
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

app.put("/put/:id", limiter, async (req, res) => {

    try {

        const { title, content, category, tags } = req.body
        
        const id = req.params.id
        
        const result = await pool.query(
            `UPDATE posts
            SET title = $1, content = $2, category = $3, tags = $4
            WHERE ID = $5
            RETURNING *
            `,
            [title, content, category, tags, id]
        )

        if (result.rowCount === 0) {
            return res.status(400).json({error: "Post could not be found!"})
        }

        await client.del("posts:all")
        await client.del(`get:${id}`)

        res.status(200).json(result.rows[0])

    } catch (error) {
        console.error("Resource could not be found!", error.message)
    }
})

app.get("/get/:single", limiter, async (req, res) => {
    
    try {
        const item = req.params.single
        const cache = await client.get(`get:${item}`)

        if (cache) {
            console.log("Getting the data from cache...")
            return res.json(JSON.parse(cache))
        }

        console.log("Fetching data in the database...")

        const result = await pool.query(
            `SELECT * FROM posts WHERE id=$1`, [item]
        )
        
        if (result.rows.length === 0) {
            return res.status(404).json({error: "Post was not found"})
        }
        
        await client.setEx(`get:${item}`, 1800, JSON.stringify(result.rows[0]))

        res.json(result.rows[0])

    } catch (error) {
        console.error("Error detected!", error.message)
    }

})


app.delete("/delete/:id", limiter, async(req, res) => {

    try {

        const item = req.params.id

        console.log("Getting data from the database...")

        const result = await pool.query(
            `DELETE FROM posts WHERE id=$1 RETURNING *`, 
            [item],
        )

        if (result.rowCount === 0) {
            return res.status(404).json({error: "Could not find the desired post!"})
        }
    
        await client.del(`get:${item}`)
        await client.del(`posts:all`)

        res.status(200).json(result.rows[0])

    } catch (error) {
        console.error("Error deleting posts", error.message)
    }
})

app.get("/posts", limiter, async (req, res) => {

    if (!req.query.term) {
        return res.status(400).json({ error: "Item was not inputted!"})
    }

    const term = req.query.term.toLowerCase()

    const redis_cache = await client.get(`posts:${term}`)

    if (redis_cache) {
        console.log("Getting data")
        return res.json(JSON.parse(redis_cache))
    }


})

app.listen(PORT, () => {
    console.log(`The server is now listening to port ${PORT}`)
})
