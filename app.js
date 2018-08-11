const express = require('express')
const bodyParser = require('body-parser')
const HTTPError = require('node-http-error')
const R = require('ramda')

const port = process.env.PORT || 3000
const app = express()

app.use(bodyParser.json())

////////////////
///// POST /////
app.post('/x', (req, res, next) => {
  const body = R.propOr(null, 'body', req)

  if (R.isEmpty(body) || body === null)
    return next(new HTTPError(400, `Missing request body`))
  
  return res.status(200).send('success')
})

///////////////
///// GET /////
app.get('/x/:id', (req, res, next) => {})

///////////////
///// PUT /////
app.put('/x/:id', (req, res, next) => {
  const body = R.propOr(null, 'body', req)

  if (R.isEmpty(body) || body === null)
    return next(new HTTPError(400, `Missing request body`))

  return res.status(200).send('success')
})

//////////////////
///// DELETE /////
app.delete('/x/:id', (req, res, next) => {})


/////////////////////////
///// ERROR HANDLER /////
app.use((err, req, res, next) => {
  console.log(req.method, ' ', req.path, ' ', 'error ', err)
  res.status(err.status || 500).send(err)
})

app.listen(port, () => console.log(`API listening on port`, port))