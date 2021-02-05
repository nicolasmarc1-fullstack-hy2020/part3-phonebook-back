// perso middleware imports
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
  console.error("error handler", error.message)

  // if (error.name === 'CastError' && error.kind == 'ObjectId') {
  // error.kind is undefined, use path instead
  if (error.name === 'CastError' && error.path === '_id') {
    return response.status(400).send({ error: 'malformatted id' })
  }
  if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}



// express app start
require('dotenv').config()
const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')
// models / db connection in module exposing public interface
const Person = require('./models/person')



// start middleware use
app.use(express.static('build'))
app.use(cors())
app.use(express.json())


// eslint-disable-next-line no-unused-vars
morgan.token('body', function (req, res) { return JSON.stringify(req.body) })
//  tiny + created token body
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))
// app.use(morgan('tiny'))


// routing
app.get('/info', (req, res) => {
  Person.find({}).then(people => {
    res.send(`<p>Phonebook has info for ${people.length} people</p><p>${new Date()}</p>`)
  })
})

app.get('/api/persons', (req, res) => {
  Person.find({}).then(persons => {
    res.json(persons.map(person => person.toJSON()))
  })
})
app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id).then(person => {
    if (person) {
      res.json(person.toJSON())
    }
    else {
      //404 not found
      res.status(404).end()
    }
  }).catch(error => next(error))
})

app.delete('/api/persons/:id', (req, res, next) => {
  // documentation recommend Note.findByIdAndDelete instead of Note.findByIdAndRemove new ?  https://mongoosejs.com/docs/api.html#model_Model.findOneAndDelete
  Person.findByIdAndDelete(req.params.id).
    then(deletedNote => {
      console.log(deletedNote);
      res.status(204).end()
    }).catch(error => next(error))
})

app.post('/api/persons', (req, res, next) => {
  const body = req.body
  // if (!body.name || !body.number) {
  //   return res.status(400).json({
  //     error: 'The name or number is missing'
  //   })
  // }

  const personToCreate = new Person({
    name: body.name,
    number: body.number
  })

  personToCreate
    .save()
    .then(savedPerson => savedPerson.toJSON())
    .then(savedAndFormattedPerson => res.json(savedAndFormattedPerson))
    .catch(error => next(error))

})

app.put('/api/persons/:id', (req, res, next) => {
  const body = req.body
  // only update number not name
  const person = {
    number: body.number,
  }

  Person.findByIdAndUpdate(req.params.id, person, { new: true })
    .then(updatedPerson => {
      if (updatedPerson) {
        res.json(updatedPerson.toJSON())
      } else {
        //404 not found
        res.status(404).end()
      }
    })
    .catch(error => next(error))
})

// ending middleware
app.use(unknownEndpoint)
app.use(errorHandler)

// app start
const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})