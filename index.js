const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dialogflow = require('@google-cloud/dialogflow');
const uuid = require('uuid');
const path = require('path');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public')); // Serve static files like index.html

// Dialogflow config
const sessionClient = new dialogflow.SessionsClient({
  keyFilename: path.join(__dirname, 'dialogflow-key.json'),
});
const projectId = 'test-dwui'; // 🟡 Replace with your actual Dialogflow project ID

app.post('/ask', async (req, res) => {
  const message = req.body.message;
  const sessionId = uuid.v4(); // Unique session for each user
  const sessionPath = sessionClient.projectAgentSessionPath(projectId, sessionId);

  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text: message,
        languageCode: 'en-US',
      },
    },
  };

  try {
    const responses = await sessionClient.detectIntent(request);
    const result = responses[0].queryResult;
    res.json({ reply: result.fulfillmentText });
  } catch (err) {
    console.error('Dialogflow error:', err);
    res.status(500).send('Error talking to Dialogflow');
  }
});

app.listen(port, () => {
  console.log(`🤖 Server running at http://localhost:${port}`);
});