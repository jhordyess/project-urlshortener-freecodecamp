require('dotenv').config()
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const app = express()

// Basic Configuration
const port = process.env.PORT || 3000

app.use(cors())

// Help to parse the body of the request from x-www-form-urlencoded to JSON
app.use(bodyParser.urlencoded({ extended: false }))

// Serve static assets
app.use('/public', express.static(`${process.cwd()}/public`))

app.get('/', (_, res) => {
  res.sendFile(process.cwd() + '/views/index.html')
})

// Your first API endpoint
app.get('/api/hello', (_, res) => {
  res.json({ greeting: 'hello API' })
})

app.listen(port, () => {
  console.log(`Listening on port ${port}`)
})
