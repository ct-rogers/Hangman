const fs = require("fs")
const express = require("express")
const app = express()
const bodyParser = require("body-parser")
const mustacheExpress = require("mustache-express")
const expressValidator = require("express-validator")
const words = fs.readFileSync("/usr/share/dict/words", "utf-8").toLowerCase().split("\n")

var count = 8
var guesses = []
var underscores = []
var secretword = []

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(expressValidator())

app.engine("mst", mustacheExpress())
app.set("views", "./views")
app.set("view engine", "mst")

let randomWord = function() {
  let i = Math.floor(Math.random() * words.length)
  return words[i]
}

app.get("/", (req, res) => {
  count = 8
  let playing = "Y"
  underscores = []
  secretword = []
  guesses = []
  var newword = randomWord()
  console.log(newword)

  for (let j = 0; j < newword.length; j++) {
    secretword.push(newword[j])
  }

  underscores = secretword.map(x => {
    return (x = "_")
  })
  console.log(secretword)
  console.log(underscores)

  res.render("home", { underscores: underscores, guesses: guesses, count: count, playing: playing })
})

app.post("/", (req, res) => {
  let playing = "Y"
  req.checkBody("guess", "You need to guess a LETTER!.").notEmpty().isLength(0, 1).isAlpha()

  var errors = req.validationErrors()
  if (errors) {
    res.render("home", {
      underscores: underscores,
      guesses: guesses,
      count: count,
      secretword: secretword,
      playing: playing,
      errors: errors
    })
  } else if (guesses.includes(req.body.guess)) {
    errors = { msg: "Garsh! You already tried that letter - pick another letter!" }
    res.render("home", {
      underscores: underscores,
      guesses: guesses,
      count: count,
      secretword: secretword,
      playing: playing,
      errors: errors
    })
  } else {
    if (count != 0) {
      if (secretword.includes(req.body.guess)) {
        for (let q = 0; q < secretword.length; q++) {
          if (secretword[q] === req.body.guess) {
            underscores.splice(q, 1, req.body.guess)
          }
        }
      } else {
        count -= 1
        console.log(count)
      }
      guesses.push(req.body.guess)
    }

    if (count === 0) {
      let loseCondition = "L"
      res.render("home", {
        underscores: underscores,
        guesses: guesses,
        count: count,
        loseCondition: loseCondition,
        secretword: secretword
      })
    } else if (underscores.includes("_")) {
      res.render("home", { underscores: underscores, guesses: guesses, count: count, playing: playing })
    } else if (underscores.includes("_") === false) {
      let winCondition = "W"
      res.render("home", { underscores: underscores, guesses: guesses, count: count, winCondition: winCondition })
    }
  }
})

app.post("/again", (req, res) => {
  res.redirect("/")
})

app.listen(3000, () => {
  console.log("App is listening")
})
