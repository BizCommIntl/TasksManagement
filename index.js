// index.js
const express = require('express')

const app = express()
const PORT = 3000

app.set('views', './views');



// app.get('/', (req, res) => {
//   res.send('Hey this is my API running 🥳')
// })

// app.get('/about', (req, res) => {
//   res.send('This is my about route..... ')
// })

app.get("/", async (req, res) => {
  //console.log('req.session.userDetail: \n',req.session.userDetail)
      res.render("home.hbs")
})


app.listen(PORT, () => {
  console.log(`API listening on PORT ${PORT} `)
})

// Export the Express API
module.exports = app
