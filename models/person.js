const mongoose = require('mongoose')

const url = process.env.MONGODB_URI

console.log('connecting to', url)

mongoose.connect(url)
  .then(result => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message)
  })

/* const personSchema = new mongoose.Schema({
    name: String,
    number: String,
}) */

const personSchema = new mongoose.Schema({
    name: {
      type: String,
      minlength: 3,
    },
    number: {
      type: String,
      validate: {
        validator: function(v) {
          return /^\d{2,3}-\d{5,10}/.test(v);   // 2 to 3 digits - 5 to 10 digits
        },
        message: props => `${props.value} is not a valid phone number!`
      },
      minLength: 8,
    },
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Person', personSchema)

