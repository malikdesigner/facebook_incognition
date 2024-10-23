const axios = require('axios'); // Ensure you are using axios
async function launchIncognition() {
    const args = process.argv.slice(2);
    const incognitonProfileID = args[0];
    console.log(incognitonProfileID)
    const url = `http://localhost:35000/automation/launch/puppeteer/${incognitonProfileID}`;
   // const url='https://www.facebook.com/messages';
  try {
    const response = await axios.get(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const body = response.data;
    console.log('Response from Incognition:', body); // Log the response

    if (!body.puppeteerUrl) {
      console.error('Puppeteer URL not found in the response.');
      return;
    }

    while (true) {
      await actions(body);
      await sleepFor(5000);
    }
  } catch (error) {
    console.error('Error launching Incognition:', error);
  }
}
launchIncognition()