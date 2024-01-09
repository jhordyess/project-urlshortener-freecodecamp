require('dotenv').config()
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const app = express()

// Basic Configuration
const port = process.env.PORT || 3000
const uri = process.env.MONGO_URI

mongoose.connect(uri)

const urlSchema = new mongoose.Schema({
  original_url: String,
  short_url: Number
})

const Url = mongoose.model('Url', urlSchema)

const createUrl = async (url, done) => {
  try {
    const num = await Url.countDocuments()

    const newUrl = new Url({
      original_url: url,
      short_url: num + 1
    })
    await newUrl.save()
    done(null, newUrl)
  } catch (error) {
    done(error)
  }
}

const findUrl = async (short_url, done) => {
  try {
    const url = await Url.findOne({ short_url })
    done(null, url)
  } catch (error) {
    done(error)
  }
}

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

app.post('/api/shorturl', async (req, res, next) => {
  const { url } = req.body

  const regex = /^(http|https):\/\/([\da-z.-]+)\.([a-z]{2,6})\/?(?:[-a-zA-Z0-9()@:%_\+.~#?&=]*)$/

  if (!regex.test(url)) return next({ message: 'invalid url' })

  await createUrl(url, (err, data) => {
    if (err) return next(err)
    if (!data) return next({ message: 'No URL was created' })
    res.json({
      original_url: data.original_url,
      short_url: data.short_url
    })
  })
})

app.get('/api/shorturl/:short_url', async (req, res, next) => {
  const { short_url } = req.params

  if (!short_url) return next({ message: 'No short URL was provided' })

  if (isNaN(short_url)) return next({ message: 'Invalid short URL' })

  await findUrl(short_url, (err, data) => {
    if (err) return next(err)
    if (!data) return next({ message: 'No short URL found' })
    res.redirect(data.original_url)
  })
})

// Error handling middleware
app.use((err, _, res, next) => {
  if (err) res.json({ error: err.message || 'SERVER ERROR' })
  next()
})

app.listen(port, () => {
  console.log(`Listening on port ${port}`)
})
