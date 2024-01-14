const express = require("express");
const axios = require("axios");
const cors = require("cors");
const bodyParser = require("body-parser");
const session = require("express-session");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();

const app = express();
const port = 5500;

const generateRandomKey = () => {
  return uuidv4();
};

app.use(
  session({
    secret: generateRandomKey(), // Use the generated key here
    resave: true,
    saveUninitialized: true,
  })
);

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

app.use(express.static("keyboard"));

app.post("/translate", async (req, res) => {
  const apiUrl = process.env.DEEPL_END_POINT;
  const apiKey = process.env.DEEPL_API_KEY;

  try {
    const response = await axios.post(apiUrl, req.body, {
      headers: {
        Authorization: `DeepL-Auth-Key ${apiKey}`,
        "Content-Type": "application/json",
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/speak", async (req, res) => {
  const voiceId = req.body.voiceId || process.env.ELEVENLABS_VOICE_ID;
  console.log("Voice ID:", voiceId);

  var voice_id = process.env.ELEVENLABS_VOICE_ID;

  var apiUrl = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?optimize_streaming_latency=0&output_format=mp3_44100_128`; // Added backticks

  try {
    const response = await axios.post(apiUrl, req.body, {
      headers: {
        Accept: "audio/mpeg",
        "xi-api-key": process.env.ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
      },
      responseType: "arraybuffer",
    });

    // console.log("Speech API Response:", response);

    // Update the session with the current voice ID
    req.session.voiceId = voiceId;

    res.status(200).send(Buffer.from(response.data, "binary"));
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
