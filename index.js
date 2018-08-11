require('dotenv').config()

const express = require('express')
const bodyParser = require('body-parser')
const HTTPError = require('node-http-error')
const R = require('ramda')

const port = process.env.PORT || 3000
const app = express()

app.use(bodyParser.json())

//////////////////
///// CREATE /////
app.post('/test', (req, res, next) => {
  const body = R.propOr(null, 'body', req)

  if (R.isEmpty(body) || body === null)
    return next(new HTTPError(400, `missing request body`))
  
  return res.status(200).send('success')
})

////////////////
///// LIST /////
app.get('/test', (req, res, next) => {
  return res.status(200).send('success')
})

///////////////
///// GET /////
app.get('/test/:id', (req, res, next) => {
  return res.status(200).send('success')
})

//////////////////
///// UPDATE /////
app.put('/test/:id', (req, res, next) => {
  const body = R.propOr(null, 'body', req)

  if (R.isEmpty(body) || body === null)
    return next(new HTTPError(400, `missing request body`))

  return res.status(200).send('success')
})

//////////////////
///// DELETE /////
app.delete('/test/:id', (req, res, next) => {
  return res.status(200).send('success')
})

/////////////////////////
///// ERROR HANDLER /////
app.use((err, req, res, next) => {
  console.log(req.method, '::', req.path, '::', 'error', err)
  res.status(err.status || 500).send(err)
})

app.listen(port, () => console.log(`API listening on port`, port))