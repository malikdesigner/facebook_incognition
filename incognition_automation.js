
const puppeteer = require('puppeteer');
const request = require('request-promise'); // Use request-promise for promise-based calls
// const incognitonProfileID = '011b6a8b-f698-4c6e-92f7-03e4c2e8edd1';
const path = require('path');
const fs = require('fs');
const axios=require('axios');
const { console } = require('inspector');
const filePath = path.join(__dirname, 'websitee.txt');
const args = process.argv.slice(2);
const incognitonProfileID = args[0];
console.log(incognitonProfileID)
const url = `http://localhost:35000/automation/launch/puppeteer/${incognitonProfileID}`;
console.log(url)
let keywordsFromFile;
try {
  keywordsFromFile = fs.readFileSync(filePath, 'utf-8').split('\n').map(keyword => keyword.trim());
} catch (error) {
  console.error('Error reading the file:', error);
}
async function sleepFor(sleepDuration) {
  return new Promise((resolve) => setTimeout(resolve, sleepDuration));
}

async function actions(body) {
 // await sleepFor(3000); // Wait for the browser to start

  try {
    const browserURL = body.puppeteerUrl;
    console.log(browserURL)
    const browser = await puppeteer.connect({
      browserURL
    });

    const page = await browser.newPage();
    try {
      await page.goto('https://www.facebook.com/messages', { waitUntil: 'networkidle2', timeout: 120000 });
    } catch (error) {
      console.log('Navigation timeout or error:', error);
    }

    await new Promise(resolve => setTimeout(resolve, 2000));
    const checkKeywords = ['yes', 'sure', 'yeah', 'here is our website', 'www'];
    let mergedTextContent = ['sent', 'you sent', 'enter', 'facebook','active now', 'end-to-end encrypted', 'messages and calls are secured with end-to-end encryption. Learn more', '00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23'];

    console.log('Automation started successfully.');
    while (true) {
      await new Promise(resolve => setTimeout(resolve, 50000));

    var articles = await page.$$('[aria-label="Thread list"] a[role="link"]');
    if (articles.length > 1) {
      // Output the array
      console.log(mergedTextContent);
      for (let i = 0; i < 15; i++) {
        try {
          await articles[i].click(); // Click on the article
        } catch (err) {
          console.log("Element found but did not click:", err);
        }

        await new Promise(resolve => setTimeout(resolve, 4000));
        let messageText = await page.evaluate(() => {
          const gridElements = document.querySelectorAll('[role="grid"]');
          return gridElements[2]?.innerText || '';
        });

        if (messageText) {
          // Split messages into lines, trim whitespace, and filter out empty lines
          const messageLines = messageText.split('\n').map(line => line.trim()).filter(line => line !== '');
          let unwantedKeywords = await page.evaluate(() => {
            const gridElements = document.querySelectorAll('[role="main"]');
            return gridElements[1]?.getAttribute('aria-label') || '';
          });
          console.log(unwantedKeywords)
          if (unwantedKeywords) {
            var unwantedMessage = unwantedKeywords.split(' ').map(line => line.trim()).filter(line => line !== '');
          }
          console.log(unwantedMessage)
          // Log the original messages for debugging
          console.log(messageLines);

          let lastMessage = '';
          let secondLastMessage = '';


          // Retrieve the last two meaningful messages
          for (let j = messageLines.length - 1; j >= 0; j--) {
            const line = messageLines[j];
            if (!mergedTextContent.some(keyword => line.toLowerCase().includes(keyword)) && !unwantedMessage.some(keyword => line.includes(keyword))) {
              if (lastMessage === '') {
                lastMessage = line; // Last message
              } else if (secondLastMessage === '') {
                secondLastMessage = line; // Second last message
                break; // Exit after getting both messages
              }
            }
          }

          // Log the cleaned messages
          console.log(`LAST MESSAGE: ${lastMessage}`);
          console.log(`SECOND LAST MESSAGE: ${secondLastMessage}`);

          if (lastMessage) {
            console.log('Last meaningful message:', lastMessage);

            // Normalize case and check for keywords in the last message
            const normalizedLastMessage = lastMessage.toLowerCase().trim();
            if (checkKeywords.some(keyword => normalizedLastMessage.includes(keyword.toLowerCase()))) {
              console.log("Keyword found in last message!");

              // Check the second last message against the keywords from website.txt
              if (secondLastMessage) {
                console.log('Second last meaningful message:', secondLastMessage);
                const normalizedSecondLastMessage = secondLastMessage.toLowerCase().trim();
                if (keywordsFromFile.some(keyword => normalizedSecondLastMessage.includes(keyword.toLowerCase()))) {
                  console.log("Keyword found in second last message!");

                  // Locate the message input box
                  let messageBox = await page.$('[aria-label="Thread composer"] p');
                  if (messageBox) {
                    console.log("Message box found");
                    await new Promise(resolve => setTimeout(resolve, 10000));

                    // Focus on the message box and send the messages
                    await messageBox.focus();
                    await page.keyboard.type('Gotcha thanks, I know this sounds nuts, but we’ve built you a new website that will rank you higher on google and get you new clients');
                    await page.keyboard.press('Enter');
                    await new Promise(resolve => setTimeout(resolve, 10000));

                    await messageBox.focus();
                    await page.keyboard.type("Can I show it to you? If you don't like I will never message you again haha 😅");
                    await page.keyboard.press('Enter');

                    console.log("Messages sent successfully.");
                  } else {
                    console.log("Message box not found");
                  }
                } else {
                  console.log("No keyword found in second last message.");
                }
              } else {
                console.log("No second last message found.");
              }
            } else {
              console.log("No keyword found in last message.");
            }
          } else {
            console.log("No valid message found.");
          }
        } else {
          console.log("No message found in this thread");
        }
      }
    } else {
      console.log("No messages found yet");
    }
    console.log("waiting for page to reload");
    await new Promise(resolve => setTimeout(resolve, 50000));

    await page.reload();
  }

  } catch (err) {
    console.error('Error during Puppeteer actions:', err);
  }
}

async function launchIncognition() {
  try {
    const body = await request({
      url: url,
      json: true,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    while (true) {

      await actions(body);
      //sleepFor(5000);
    }
  } catch (error) {
    console.error('Error launching Incognition:', error);
  }
}

// Start the process
launchIncognition();
