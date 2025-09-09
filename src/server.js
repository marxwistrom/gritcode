import express from "express"
import cors from "cors"
import { MongoClient } from "mongodb"

const app = express()
const port = 3000

// MongoDB configuration
const uri = "mongodb://localhost:27017"
const client = new MongoClient(uri)
const dbName = "test"
const collectionName = "dummy"

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.static('.'))

// Routes
app.get("/", (req, res) => {
    res.sendFile("index.html", { root: "." })
})

app.post("/api/experiences", async (req, res) => {
    try {
        const { date, location, title, story } = req.body

        // Validation
        if (!date || !location || !title || !story) {
            return res.status(400).json({
                error: "All fields are required"
            })
        }

        await client.connect()
        const db = client.db(dbName)
        const collection = db.collection(collectionName)

        const experience = {
            date: date,
            location: location,
            title: title,
            story: story,
            timestamp: new Date()
        }

        const result = await collection.insertOne(experience)

        res.status(201).json({
            message: "Experience saved successfully",
            insertedId: result.insertedId
        })

    } catch (error) {
        console.error("Database error:", error)
        res.status(500).json({
            error: "Failed to save experience"
        })
    } finally {
        await client.close()
    }
})

// GET endpoint to retrieve experiences
app.get("/api/experiences", async (req, res) => {
    try {
        await client.connect()
        const db = client.db(dbName)
        const collection = db.collection(collectionName)

        const experiences = await collection.find({}).sort({ timestamp: -1 }).toArray()

        res.json(experiences)

    } catch (error) {
        console.error("Database error:", error)
        res.status(500).json({
            error: "Failed to retrieve experiences"
        })
    } finally {
        await client.close()
    }
})

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`)
})

