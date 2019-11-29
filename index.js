require('dotenv').config()

const express = require('express')
const bodyParser = require('body-parser')
const HTTPError = require('node-http-error')
const R = require('ramda')
const { createConnection } = require('promise-mysql')
const mysqlConnection = {
	host: process.env.DB_HOST, 
	user: process.env.DB_USER, 
	password: process.env.DB_PASS, 
	database: process.env.DB_NAME 
}
const cleanObject = require('./lib/clean-object')
const checkFields = require('./lib/check-fields')
const buildQuery = require('./lib/build-query')

const port = process.env.PORT || 3000
const app = express()

app.use(bodyParser.json())

var table = 'example'
var requiredFields = ['name']
var allowedFields = ['name', 'description']

//////////////////
///// CREATE /////
app.post(`/${table}`, (req, res, next) => {
  const body = R.propOr(null, 'body', req)
  const debug = R.pathOr(null, ['query', 'debug'], req) == 'true'

  if (debug) console.log('body', body)

  // CHECK IF BODY EXISTS
  if (R.isEmpty(body) || body === null)
    return next(new HTTPError(400, `missing request body`))

  // STRIP EMPTY VALUES
  var cleanBody = cleanObject(body)

  // STRIP UNALLOWED FIELDS
  const unallowedFields = checkFields.unallowed(allowedFields, cleanBody)
  cleanBody = R.omit(unallowedFields, cleanBody)
  if (debug) console.log('cleanBody', cleanBody)

  // CHECK REQUIRED FIELDS
  const missingFields = checkFields.required(requiredFields, cleanBody)
  if (R.not(R.isEmpty(missingFields))) 
    return next(new HTTPError(400, `missing required fields: ${R.join(', ', missingFields)}`))

  // OPEN DB CONNECTION
  var connection
  createConnection(mysqlConnection).then(conn => {
    // QUERY
    connection = conn
    var query = buildQuery.insert(table, cleanBody)
    if (debug) console.log('query', query)

    return connection.query(query, buildQuery.escapeValues(cleanBody))

  }).then(result => {
    // QUERY RESPONSE
    connection.end()
    if (debug) console.log('result', result)

    return res.status(200).send({
      message: `create ${table} success`,
      id: R.propOr(null, 'insertId', result),
      data: result
    })
  
  }).catch(error => {
    // QUERY ERROR
    if (connection && connection.end) connection.end()
    if (debug) console.log('error', error)

    return next(new HTTPError(500, error))

  })  
})

///////////////
///// GET /////
app.get(`/${table}/:id`, (req, res, next) => {
  const id = R.pathOr(null, ['params', 'id'], req)
  const debug = R.pathOr(null, ['query', 'debug'], req) == 'true'

  if (debug) console.log('id', id)

  // OPEN DB CONNECTION
  var connection
  createConnection(mysqlConnection).then(conn => {
    // QUERY
    connection = conn
    var query = buildQuery.get(table, ['id', 'name', 'description', 'created'], {id: id})
    if (debug) console.log('query', query)

    return connection.query(query, [id])

  }).then(result => {
    // QUERY RESPONSE
    connection.end()
    if (debug) console.log('result', result)

    return res.status(200).send({
      message: `get ${table} success`,
      id: id,
      data: (result.isArray && result.length > 1) ? result : R.propOr(null, 0, result)
    })
  
  }).catch(error => {
    // QUERY ERROR
    if (connection && connection.end) connection.end()
    if (debug) console.log('error', error)

    return next(new HTTPError(500, error))

  }) 
})

////////////////
///// LIST /////
app.get(`/${table}`, (req, res, next) => {
  const debug = R.pathOr(null, ['query', 'debug'], req) == 'true'

  // OPEN DB CONNECTION
  var connection
  createConnection(mysqlConnection).then(conn => {
    // QUERY
    connection = conn
    var query = buildQuery.list(table, ['id', 'name', 'description', 'created'])
    if (debug) console.log('query', query)

    return connection.query(query)

  }).then(result => {
    // QUERY RESPONSE
    connection.end()
    if (debug) console.log('result', result)

    return res.status(200).send({
      message: `list ${table} success`,
      data: result
    })
  
  }).catch(error => {
    // QUERY ERROR
    if (connection && connection.end) connection.end()
    if (debug) console.log('error', error)

    return next(new HTTPError(500, error))

  }) 
})

//////////////////
///// UPDATE /////
app.put(`/${table}/:id`, (req, res, next) => {
  const body = R.propOr(null, 'body', req)
  const id = R.pathOr(null, ['params', 'id'], req)
  const debug = R.pathOr(null, ['query', 'debug'], req) == 'true'

  if (debug) console.log('body', body)
  if (debug) console.log('id', id)

  // CHECK IF BODY EXISTS
  if (R.isEmpty(body) || body === null)
    return next(new HTTPError(400, `missing request body`))

  // STRIP EMPTY VALUES
  var cleanBody = cleanObject(body)

  // STRIP UNALLOWED FIELDS
  const unallowedFields = checkFields.unallowed(allowedFields, cleanBody)
  cleanBody = R.omit(unallowedFields, cleanBody)
  if (debug) console.log('cleanBody', cleanBody)

  // OPEN DB CONNECTION
  var connection
  createConnection(mysqlConnection).then(conn => {
    // QUERY
    connection = conn
    var query = buildQuery.update(table, cleanBody, {id: id})
    if (debug) console.log('query', query)

    return connection.query(query, buildQuery.escapeValues(cleanBody))

  }).then(result => {
    // QUERY RESPONSE
    connection.end()
    if (debug) console.log('result', result)

    return res.status(200).send({
      message: `update ${table} success`,
      id: id,
      data: result
    })
  
  }).catch(error => {
    // QUERY ERROR
    if (connection && connection.end) connection.end()
    if (debug) console.log('error', error)

    return next(new HTTPError(500, error))

  }) 
})

//////////////////
///// DELETE /////
app.delete(`/${table}/:id`, (req, res, next) => {
  const id = R.pathOr(null, ['params', 'id'], req)
  const debug = R.pathOr(null, ['query', 'debug'], req) == 'true'

  //console.log('debug:', debug)
  if (debug) console.log('id', id)

  // OPEN DB CONNECTION
  var connection
  createConnection(mysqlConnection).then(conn => {
    // QUERY
    connection = conn
    var query = buildQuery.delete(table, {id: id})
    if (debug) console.log('query', query)

    return connection.query(query, [id])

  }).then(result => {
    // QUERY RESPONSE
    connection.end()
    if (debug) console.log('result', result)

    return res.status(200).send({
      message: `delete ${table} success`,
      id: R.propOr(null, 'insertId', result),
      data: result
    })
  
  }).catch(error => {
    // QUERY ERROR
    if (connection && connection.end) connection.end()
    if (debug) console.log('error', error)

    return next(new HTTPError(500, error))

  }) 
})

/////////////////////////
///// ERROR HANDLER /////
app.use((err, req, res, next) => {
  console.log(req.method, '::', req.path, '::', 'error', err)
  return res.status(err.status || 500).send(err)
})

app.listen(port, () => console.log(`API listening on port`, port))