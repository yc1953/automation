const pup = require('puppeteer');
const fs = require('fs');

let questionDetails;
fs.readFile('./data.json', 'utf-8', (err, data) => {
    data = JSON.parse(data);
    questionDetails = data["Questions"];
})

const main = async () => {
    let browser = await pup.launch({
        headless: false,
        defaultViewport: false,
        args: ['--start-maximized']
    });

    let pages = await browser.pages();
    let tab = pages[0];
    await tab.goto('https://www.google.com');
    await tab.waitForSelector('.gLFyf.gsfi', { visible: true });
    await tab.type('.gLFyf.gsfi', 'Create quiz testmoz');
    await tab.keyboard.press('Enter');
    await tab.waitForSelector('.LC20lb.DKV0Md', { visible: true });
    let firstURL = await tab.$('.LC20lb.DKV0Md');
    await firstURL.click();
    await tab.waitForSelector('.landing-button-build', { visible: true });
    await tab.click('.landing-button-build');
    await tab.waitForSelector('input[id="id_name"]', { visible: true });
    await tab.type('input[id="id_name"]', 'JavaScript Quiz');
    await tab.type('input[id="id_password"]', 'temp');
    await tab.type('input[id="id_confirm_password"]', 'temp');
    await tab.click('#start-form button');
    await tab.waitForSelector('.nav-section.active-section a', { visible: true });
    let listItems = await tab.$$('.nav-section.active-section a');
    await listItems[3].click();

    for (let j = 0; j < questionDetails.length; j++) {
        let dy = (j + 1) * 100 + 500;
        await tab.mouse.wheel({ deltaY: dy });
        await new Promise((resolve, reject) => {
            setTimeout(async () => {
                resolve();
            }, 3000);
        });

        await createQuestions(tab, questionDetails[j]);
    }
    await tab.waitForSelector('.nav-section.active-section a', { visible: true });
    listItems = await tab.$$('.nav-section.active-section a');
    await listItems[4].click();
    await tab.waitForSelector('.action-bar button', { visible: true });
    await tab.click('.action-bar button');
    await tab.waitForSelector('.url-aside a', { visible: true });
    let element = await tab.$('.url-aside a')
    let value = await tab.evaluate(el => el.textContent, element);
    let finalQuizURL = "https://" + value;
    console.log("Got the quiz URL!");
    console.log(finalQuizURL);
    await browser.close();
};

const createQuestions = async (tab, questionDetail) => {
    await tab.waitForSelector('.testmoz-insert', { visible: true });
    await tab.click('.testmoz-insert');
    await tab.keyboard.press('ArrowDown');
    await tab.keyboard.press('Enter');

    await tab.waitForSelector('.testmoz-component.testmoz-component-multiple-choice.testmoz-active-component p', { visible: true });
    let questionsAndOptions = await tab.$$('.testmoz-component.testmoz-component-multiple-choice.testmoz-active-component p');
    await questionsAndOptions[0].type(questionDetail["Question"]);
    for (let i = 1; i < questionsAndOptions.length; i++) {
        await questionsAndOptions[i].click();
        await questionsAndOptions[i].type(questionDetail[i]);
    }
    await tab.click('.testmoz-component.testmoz-component-multiple-choice.testmoz-active-component .testmoz-points-input');
    await tab.type('.testmoz-component.testmoz-component-multiple-choice.testmoz-active-component .testmoz-points-input', '0');

    let correctAnswer = questionDetail["Correct"];
    let options = await tab.$$('.testmoz-component.testmoz-component-multiple-choice.testmoz-active-component .testmoz-answer-input-input');
    await options[correctAnswer].click();
}

main();