const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('give all needed arguments')
  process.exit(1)
}


// console.log("length = " + process.argv.length)
// console.log(process.argv)

const password = process.argv[2]
const name = process.argv[3]
const number = process.argv[4]
const url =`mongodb+srv://ml:${password}@cluster0.ar17l.mongodb.net/?retryWrites=true&w=majority`

mongoose.connect(url)

// skeema
const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

// model
const Person = mongoose.model('Person', personSchema)

// olio
const person = new Person({
  name: name,
  number: number,
})

if (process.argv.length === 3) {
  console.log('phonebook:')
  Person.find({}).then(result => {
    result.forEach(p => {
      console.log(`${p.name} ${p.number || ''}`)
    })
    mongoose.connection.close()
  })
} else {
  // eslint-disable-next-line no-unused-vars
  person.save().then(result => {
    console.log(`added ${name} number ${number} to phonebook`)
    mongoose.connection.close()
  })
}


