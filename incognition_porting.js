const puppeteer = require('puppeteer-extra');
const pluginStealth = require("puppeteer-extra-plugin-stealth");
const axios = require('axios');
const path = require('path');
const filePath = path.join(__dirname, 'websitee.txt');

const fs = require('fs');
const args = process.argv.slice(2);
const profile = args[0];
const port = args[1]
console.log(profile);
console.log(port)
const { exec } = require('child_process');
text = '';
let keywordsFromFile;
try {
    keywordsFromFile = fs.readFileSync(filePath, 'utf-8').split('\n').map(keyword => keyword.trim());
} catch (error) {
    console.error('Error reading the file:', error);
}

(async () => {
    try {
        puppeteer.use(pluginStealth());

        // Step 1: Launch Chrome with remote debugging port using child_process
        const chromePath = '"C:\\Users\\Naveed\\AppData\\Local\\Programs\\incogniton\\chrome.exe"';
        const userDataDir = `"C:\\Users\\Anas\\AppData\\Local\\Google\\Chrome\\User Data\\Profile ${profile}"`;
        const remoteDebuggingPort = port;


        // Command to launch Chrome
        //to view the browser
        const chromeLaunchCommand = `${chromePath} --remote-debugging-port=${remoteDebuggingPort} --user-data-dir=${userDataDir}`;
        //to hide the browser
        //const chromeLaunchCommand = `${chromePath} --headless --remote-debugging-port=${remoteDebuggingPort} --user-data-dir=${userDataDir}`;

        // Run the Chrome instance
        exec(chromeLaunchCommand, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error launching Chrome: ${error.message}`);
                return;
            }
            console.log('Chrome launched successfully!');
        });

        // Wait a few seconds to allow Chrome to launch
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Step 2: Connect Puppeteer to the running Chrome instance
        const response = await axios.get(`http://127.0.0.1:${remoteDebuggingPort}/json/version`);
        const { webSocketDebuggerUrl } = response.data;

        const browser = await puppeteer.connect({
            browserWSEndpoint: webSocketDebuggerUrl,
            ignoreHTTPSErrors: true,
            defaultViewport: null,
            headless: true,  // Run in headless mode
            args: ['--start-maximized']  // Keep this if you want window maximized even in headless mode
        });


        console.log(await browser.pages());  // Log currently open pages

        // Step 3: Open a new page and automate Gmail login
        const page = await browser.newPage();

        // Wait before navigating
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Attempt to navigate with retries
        try {
            await page.goto('https://www.facebook.com/messages', { waitUntil: 'networkidle2', timeout: 120000 });
        } catch (error) {
            console.log('Navigation timeout or error:', error);
        }

        await new Promise(resolve => setTimeout(resolve, 2000));
        const checkKeywords = ['yes', 'sure', 'yeah', 'here is our website', 'www'];
        let mergedTextContent = ['Sent', 'You sent', 'Enter', 'Facebook', 'end-to-end encrypted', 'Messages and calls are secured with end-to-end encryption. Learn more','00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23'];

        console.log('Automation started successfully.');
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
                    if(unwantedKeywords){
                        var unwantedMessage=   unwantedKeywords.split(' ').map(line => line.trim()).filter(line => line !== '');
                    }
                    console.log(unwantedMessage)
                    // Log the original messages for debugging
                    console.log(messageLines);

                    let lastMessage = '';
                    let secondLastMessage = '';


                    // Retrieve the last two meaningful messages
                    for (let j = messageLines.length - 1; j >= 0; j--) {
                        const line = messageLines[j];
                        if (!mergedTextContent.some(keyword => line.includes(keyword)) && !unwantedMessage.some(keyword => line.includes(keyword))) {
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


        // Optionally: Close the browser (or keep it running for further automation)
        // await browser.close();
    } catch (error) {
        console.error('Error in Puppeteer script:', error);
    }
})();
