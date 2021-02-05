//  Command-line database
const mongoose = require('mongoose')

if ( process.argv.length<3 ) {
  console.log('give password as argument')
  process.exit(1)
}
if ( process.argv.length === 4 ) {
  console.log('name or number missing')
  process.exit(1)
}

const password = process.argv[2]
const newName = process.argv[3]
const newNumber = process.argv[4]

const url =
`mongodb+srv://nico:${password}@cluster0-ptvwu.mongodb.net/phonebook-app?retryWrites=true&w=majority`

console.log(url)
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)

const person = new Person({
  name: newName,
  number: newNumber,
})

if ( process.argv.length === 3 ) {
  Person.find({}).then(response => {
    console.log(response)
    console.log("phonebook:")
    response.forEach(person => {
      console.log(`${person.name} ${person.number}`)
    })
    mongoose.connection.close()
  })
}
if ( process.argv.length >4 ) {
  person.save().then(response => {
    console.log(`added ${response.name} number ${response.number} to phonebook`)
    mongoose.connection.close()
  })
}


// node mango.js pwd  "Arto Hellas" 040-1234556
// node mango.js pwd "Ada Lovelace" 39-44-5323523
// node mango.js pwd "Dan Abramov" 12-43-234345
// node mango.js pwd "Mary Poppendieck" 39-23-6423122

