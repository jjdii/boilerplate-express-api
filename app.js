require('dotenv').config()

const dal = require('./dal.js')
const express = require('express')
const bodyParser = require('body-parser')
const HTTPError = require('node-http-error')
const R = require('ramda')
const checkReqFields = require('./lib/check-req-fields.js')

const port = process.env.PORT || 3000
const app = express()

app.use(bodyParser.json())

/////////////////////
///// POST book /////
app.post('/books', (req, res, next) => {
  const body = R.propOr(null, 'body', req)

  // stop if request body is bad
  if (R.isEmpty(body) || body === null)
    return next(new HTTPError(400, `Missing request body`))

  // insure {type: book} is in body object
  // omit _id and _rev from body object
  const bodyClean = R.compose(
    R.omit(['_id', '_rev']),
    R.merge(R.__, { type: 'book' })
  )(body)

  // check if any required fields are missing
  const missingFields = checkReqFields(
    ['title', 'author', 'type', 'genre', 'description', 'ISBN'],
    bodyClean
  )

  // stop if missing required fields
  if (R.not(R.isEmpty(missingFields)))
    return next(
      new HTTPError(
        400,
        `Missing required fields: ${R.join(', ', missingFields)}`
      )
    )

  dal.addBook(bodyClean, (err, doc) => {
    if (err) return next(new HTTPError(err.status, err.message))
    res.status(200).send(doc)
  })
})

/////////////////////////
///// GET all books /////
app.get('/books', (req, res, next) =>
  dal.getAllData((err, doc) => {
    if (err) return next(new HTTPError(err.status, err.message))

    const docs = R.compose(
      R.filter(R.propEq('type', 'book')),
      R.map(x => x.doc)
    )(doc.rows)

    res.status(200).send(docs)
  })
)

////////////////////
///// GET book /////
app.get('/books/:id', (req, res, next) =>
  dal.getBook(req.params.id, (err, doc) => {
    if (err) return next(new HTTPError(err.status, err.message))
    res.status(200).send(doc)
  })
)

////////////////////
///// PUT book /////
app.put('/books/:id', (req, res, next) => {
  const body = R.propOr(null, 'body', req)

  if (R.isEmpty(body) || body === null)
    return next(new HTTPError(400, `Missing request body`))

  const missingFields = checkReqFields(
    ['_id', '_rev', 'type', 'title', 'author', 'genre', 'description', 'ISBN'],
    body
  )

  if (R.not(R.isEmpty(missingFields)))
    return next(
      new HTTPError(
        400,
        `Missing required fields: ${R.join(', ', missingFields)}`
      )
    )

  dal.updateBook(body, (err, doc) => {
    if (err) return next(new HTTPError(err.status, err.message))
    res.status(200).send(doc)
  })
})

///////////////////////
///// DELETE book /////
app.delete('/books/:id', (req, res, next) =>
  dal.deleteBook(req.params.id, (err, doc) => {
    if (err) return next(new HTTPError(err.status, err.message))
    res.status(200).send(doc)
  })
)

///////////////////////
///// POST author /////
app.post('/authors', (req, res, next) => {
  const body = R.propOr(null, 'body', req)

  // stop if request body is bad
  if (R.isEmpty(body) || body === null)
    return next(new HTTPError(400, `Missing request body`))

  // insure {type: author} is in body object
  // omit _id and _rev from body object
  const bodyClean = R.compose(
    R.omit(['_id', '_rev']),
    R.merge(R.__, { type: 'author' })
  )(body)

  // check if any required fields are missing
  const missingFields = checkReqFields(
    ['name', 'placeBirth', 'dateBirth'],
    bodyClean
  )

  // stop if missing required fields
  if (R.not(R.isEmpty(missingFields)))
    return next(
      new HTTPError(
        400,
        `Missing required fields: ${R.join(', ', missingFields)}`
      )
    )

  dal.addAuthor(bodyClean, (err, doc) => {
    if (err) return next(new HTTPError(err.status, err.message))
    res.status(200).send(doc)
  })
})

///////////////////////////
///// GET all authors /////
app.get('/authors', (req, res, next) =>
  dal.getAllData((err, doc) => {
    if (err) return next(new HTTPError(err.status, err.message))

    const docs = R.compose(
      R.filter(R.propEq('type', 'author')),
      R.map(x => x.doc)
    )(doc.rows)

    res.status(200).send(docs)
  })
)

//////////////////////
///// GET author /////
app.get('/authors/:id', (req, res, next) =>
  dal.getAuthor(req.params.id, (err, doc) => {
    if (err) return next(new HTTPError(err.status, err.message))
    res.status(200).send(doc)
  })
)

//////////////////////
///// PUT author /////
app.put('/authors/:id', (req, res, next) => {
  const body = R.propOr(null, 'body', req)

  if (R.isEmpty(body) || body === null)
    return next(new HTTPError(400, `Missing request body`))

  const missingFields = checkReqFields(
    ['_id', '_rev', 'type', 'name', 'placeBirth', 'dateBirth'],
    body
  )

  if (R.not(R.isEmpty(missingFields)))
    return next(
      new HTTPError(
        400,
        `Missing required fields: ${R.join(', ', missingFields)}`
      )
    )

  dal.updateAuthor(body, (err, doc) => {
    if (err) return next(new HTTPError(err.status, err.message))
    res.status(200).send(doc)
  })
})

/////////////////////////
///// DELETE author /////
app.delete('/authors/:id', (req, res, next) =>
  dal.deleteAuthor(req.params.id, (err, doc) => {
    if (err) return next(new HTTPError(err.status, err.message))
    res.status(200).send(doc)
  })
)

/////////////////////////
///// Error handler /////
app.use((err, req, res, next) => {
  console.log(req.method, ' ', req.path, ' ', 'error ', err)
  res.status(err.status || 500).send(err)
})

app.listen(port, () => console.log(`API listening on port`, port))
