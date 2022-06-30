const express = require('express')
const morgan = require('morgan')
const app = express()
const cors = require('cors')
require('dotenv').config()
const Person = require('./models/person')

app.use(cors())
app.use(express.json())
app.use(express.static('build'))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :post'))   // https://github.com/expressjs/morgan -> tiny + oma tekemä post

morgan.token('post', (req) => {                         // jos POST metodi niin palautetaan json stringinä body. Tokeneista: https://github.com/expressjs/morgan#creating-new-tokens
  if (req.method === 'POST') {
    return JSON.stringify(req.body)                     // ilman JSON.stringify palautuisi vain [object][object]
  }
})

app.get('/api/persons', (request, response) => {
  Person.find({}).then(p => {                          // const Person = require('./models/person')
    response.json(p)                                   // muuttujassa p on taulukollinen MongoDB:n palauttamia olioita.
  })                                                   // Kun taulukko lähetetään JSON-muotoisena vastauksena, jokaisen taulukon olion toJSON-metodia kutsutaan automaattisesti JSON.stringify-metodin toimesta.
})

app.get('/info', (req, res, next) => {
  Person.countDocuments().then((personsQty) => {
    // console.log(count_documents);
    let dateTime = new Date()
    res.send(`Phonebook has info for ${personsQty} people` + '<br />' + '<br />' + `${dateTime}`)
  })
    .catch(error => next(error))
})

app.get('/api/persons/:id', (request, response, next) => {   // siirtää virhetilanteen käsittelyn eteenpäin funktiolla next, jonka se saa kolmantena parametrinaan:next
  Person.findById(request.params.id)
    .then(p => {
      if (p) {
        response.json(p)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})


app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    // eslint-disable-next-line no-unused-vars
    .then(result => {
      response.status(204).end()                          // Jos poisto onnistuu, vastataan statuskoodilla 204 no content sillä mukaan ei lähetetä mitään dataa.
    })
    .catch(error => next(error))
})


app.post('/api/persons', (request, response, next) => {
  const body = request.body

  console.log(body)

  if (body.name === '' || body.number === '') {
    const err = 'Error: name or number missing'
    return response.status(400).json(err)
  }

  const person = new Person({                               // const Person = require('./models/person')
    name: body.name,
    number: body.number || '""',
  })

  person.save().then(savedPerson => {                       // Pyyntöön vastataan save-operaation takaisinkutsufunktion sisällä (vain jos onnistunut)
    response.json(savedPerson)                              // Takaisinkutsufunktion parametri savedPerson on talletettu muistiinpano. HTTP-pyyntöön palautetaan toJSON formatoitu muoto
  })
    .catch((error) => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  const person = {
    name: body.name,
    number: body.number,
  }

  Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    const err = error.message
    return response.status(400).json(err)
  }
  next(error)
}

app.use(errorHandler)                                         // tämä tulee kaikkien muiden middlewarejen rekisteröinnin jälkeen!


const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})