const express = require('express')
const morgan = require('morgan');
const app = express()
const cors = require('cors')


let persons = [
    {
      id: 1,
      name: "Arto Hellas",
      number: "000-000"
    },
    {
      id: 2,
      name: "Ada Lovelace",
      number: "050-666999"
    },
    {
      id: 3,
      name: "Dan Abramov",
      number: "045-666666"
    },
    {
      id: 4,
      name: "Mary Poppendick",
      number: "555-000555"
    }
  ]

app.use(cors())
app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :post')); // https://github.com/expressjs/morgan -> tony + oma tekemä post

morgan.token('post', (req) => {   // jos POST metodi niin palautetaan json stringinä body. Tokeneista: https://github.com/expressjs/morgan#creating-new-tokens
  if (req.method === 'POST') {
    return JSON.stringify(req.body)  // ilman JSON.stringify palautuisi vain [object][object]

  }
})

app.get('/api/persons', (req, res) => {
    res.json(persons)
  })

app.get('/info', (req, res) => {
    const personsQty = persons.length
    let dateTime = new Date();
    res.send(`Phonebook has info for ${personsQty} people` + "<br />" + "<br />" + `${dateTime}`)
  })

app.get('/api/persons/:id', (request, response) => {
  
  const id = Number(request.params.id)                   // muutetaan parametrina oleva merkkijonomuotoinen id numeroksi. params -> https://www.geeksforgeeks.org/express-js-req-params-property/
  const person = persons.find(p => p.id === id)        // Taulukon find-metodilla haetaan taulukosta parametria vastaava muistiinpano ja palautetaan se pyynnön tekijälle
    if (person) {           
                                                   // Koodin haarautumisessa hyväksikäytetään sitä, että mikä tahansa JavaScript-olio on truthy, eli katsotaan todeksi vertailuoperaatiossa. undefined taas on falsy eli epätosi
      response.json(person)
    } else {
      response.status(404).end()                         // Koska vastaukseen ei nyt liity mitään dataa, käytetään statuskoodin asettavan metodin status lisäksi metodia end ilmoittamaan siitä, että pyyntöön tulee vastata ilman dataa.
    }

  })

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  persons = persons.filter(note => note.id !== id)
  
  response.status(204).end()                      // Jos poisto onnistuu eli poistettava muistiinpano on olemassa, vastataan statuskoodilla 204 no content sillä mukaan ei lähetetä mitään dataa.
})

const generateId = () => {                        // Uudelle muistiinpanolle tarvitaan uniikki id. Ensin selvitetään olemassa olevista id:istä suurin muuttujaan maxId. Uuden muistiinpanon id:ksi asetetaan sitten maxId + 1. Tämä tapa ei ole kovin hyvä, mutta emme nyt välitä siitä, sillä tulemme pian korvaamaan tavan, jolla muistiinpanot talletetaan
  const maxId = persons.length > 0                  // notes.map(n => n.id) muodostaa taulukon, joka koostuu muistiinpanojen id-kentistä
    ? Math.max(...persons.map(n => n.id))           // Math.max palauttaa maksimin sille parametrina annetuista luvuista. notes.map(n => n.id) on kuitenkin taulukko, joten se ei kelpaa parametriksi komennolle Math.max. 
    : 0                                           // Taulukko voidaan muuttaa yksittäisiksi luvuiksi käyttäen taulukon spread-syntaksia, eli kolmea pistettä ...taulukko.
  return maxId + 1
}

app.post('/api/persons', (request, response) => {    //  HTTP POST -pyyntö osoitteeseen http://localhost:3001/api/persons ja pyynnön bodyyn luotavan muistiinpanon tiedot JSON-muodossa.
  const body = request.body                        // Tapahtumankäsittelijäfunktio pääsee dataan käsiksi olion request kentän body avulla. Ilman json-parserin lisäämistä eli komentoa app.use(express.json()) pyynnön kentän body arvo olisi ollut määrittelemätön. Json-parserin toimintaperiaatteena on, että se ottaa pyynnön mukana olevan JSON-muotoisen datan, muuttaa sen JavaScript-olioksi ja sijoittaa request-olion kenttään body ennen kuin routen käsittelijää kutsutaan.           
 
  if (body.name === '' || !body.name) {                            // Jos vastaanotetulta datalta puuttuu sisältö kentästä content, vastataan statuskoodilla 400 bad request. Huomaa, että returnin kutsuminen on tärkeää. Ilman kutsua koodi jatkaisi suoritusta metodin loppuun asti, ja virheellinen muistiinpano tallettuisi!
    return response.status(400).json({ 
      error: 'name is missing' 
    })
  }

  if (body.number === '' || !body.number) {                            // Jos vastaanotetulta datalta puuttuu sisältö kentästä content, vastataan statuskoodilla 400 bad request. Huomaa, että returnin kutsuminen on tärkeää. Ilman kutsua koodi jatkaisi suoritusta metodin loppuun asti, ja virheellinen muistiinpano tallettuisi!
    return response.status(400).json({ 
      error: 'number is missing' 
    })
  }

  if (persons.find(p => p.name === body.name)) {
    return response.status(400).json({ 
      error: 'name must be unique' 
    })
  }

  const person = {                                // Jos content-kentällä on arvo, luodaan muistiinpano syötteen perusteella. Kuten edellisessä osassa mainitsimme, aikaleimoja ei kannata luoda selaimen koodissa, sillä käyttäjän koneen kellonaikaan ei voi luottaa. Aikaleiman eli kentän date arvon generointi onkin nyt palvelimen vastuulla
    id: generateId(),
    name: body.name,
    number: body.number,         // Jos kenttä important puuttuu, asetetaan sille oletusarvo false. Oletusarvo generoidaan nyt hieman erikoisella tavalla:
  }

  persons = persons.concat(person)

  response.json(person)
  //response.status(200).json(person);
})


// const PORT = 3001
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})