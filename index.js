// app.js
const fs = require("fs");
const express = require("express");
const morgan = require("morgan");
const path = require("path");
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const languages = [
  "zh",
  "pt-br",
  "es",
  "de",
  "it",
  "fr"
];

// Cargar palabras desde archivo
// const words = require("./data/words.json");
let words;
try {
  words = require("./data/words.json");
  console.log("words.json cargado correctamente");
} catch (err) {
  console.error("Error cargando words.json:", err);
  words = [];
}

// Middleware
app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "public")));

// Deshabilitamos la seguridad CORS
app.use(cors());

// Endpoints

// Iteración 1

// app.get('/api/v1/words', (req, res) => {
//   const randomIndex = Math.floor(Math.random() * words.length);

//   res.json({ word: words[randomIndex] });
// });

// Iteración 2

// app.get('/api/v1/words', (req, res) => {
//   console.log("GET /api/v1/words called");

//   const length = parseInt(req.query.length);

//   // Filtra solo si length está definido y es un número válido
//   let filteredWords = words;
//   if (!isNaN(length)) {
//     filteredWords = words.filter(w => w.length === length);
//   }

//   if (filteredWords.length > 0) {
//     const randomIndex = Math.floor(Math.random() * filteredWords.length);
//     res.status(200).json({ word: filteredWords[randomIndex] });
//   } else {
//     res.status(404).json({ error: "No hay palabras con esa longitud" });
//   }
// });

// Iteración 3

app.get('/api/v2/languages', (req, res) => {
  res.status(200).json({
    languages: languages
  })
})

// Iteración 4

app.get('/api/v2/words', async (req, res) => {
  const length = req.query.length;
  const lang = req.query.lang;

  try {
    const response = await fetch(`https://random-word-api.herokuapp.com/word?length=${length}&lang=${lang}`);
    const data = await response.json();

    const newWord = data[0];
    if (newWord && !words.includes(newWord)) {
      words.push(newWord);
      await fs.promises.writeFile(
        path.join(__dirname, "data", "words.json"),
        JSON.stringify(words, null, 2),
        "utf-8"
      );
    }
    res.status(200).json({ word: newWord });
  } catch (error) {
    res.status(500).json({ error: "Error procesando la petición para API externa" });
  }
});

// Bonus 2

app.get('/api/v1/words', (req, res) => {
  try {
    res.status(200).json(words);
  } catch (error) {
    res.status(500).json({ error: "Error procesando la petición GET" })
  }
});

// Bonus 3

app.get('/api/v1/words/:index', (req, res) => {
  const wordsIndex = parseInt(req.params.index);


  // res.status(200).json(words[wordsIndex]);

  if (wordsIndex < 0 || isNaN(wordsIndex) || wordsIndex > words.length) {
    res.status(400).json({ error: "Could not find index" })
  } else {
    res.status(200).json(words[wordsIndex]);

  }
});

// 404 para rutas no existentes
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
