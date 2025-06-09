const request = require('request');

let baseBet = 0.01;
let currentBet = baseBet;

const optionsTemplate = {
  method: 'POST',
  url: 'https://stake.ac/_api/casino/dice/roll',
  'headers': {
    'accept': '*/*',
    'accept-language': '',
    'content-type': '',
    'origin': '',
    'priority': '',
    'referer': '',
    'sec-ch-ua': '""',
    'sec-ch-ua-arch': '""',
    'sec-ch-ua-bitness': '',
    'sec-ch-ua-full-version': '',
    'sec-ch-ua-full-version-list': '',
    'sec-ch-ua-mobile': '',
    'sec-ch-ua-model': '""',
    'sec-ch-ua-platform': '""',
    'sec-ch-ua-platform-version': '""',
    'sec-fetch-dest': '',
    'sec-fetch-mode': '',
    'sec-fetch-site': '',
    'user-agent': '',
    'x-access-token': '',
    'x-lockdown-token': '',
    },
};

function rollDice(betAmount) {
  return new Promise((resolve, reject) => {
    const options = {
      ...optionsTemplate,
      body: JSON.stringify({
        target: 50.5,
        condition: 'above',
        identifier: 'W-fzz8MQh1tN_CHDmTjCy',
        amount: betAmount,
        currency: 'usdt'
      })
    };

    request(options, (error, response) => {
      if (error) return reject(error);

      try {
        const data = JSON.parse(response.body);
        const result = data.diceRoll.state.result;
        const target = data.diceRoll.state.target;
        const condition = data.diceRoll.state.condition;

        const win = condition === 'above'
          ? result > target
          : result < target;

        resolve({ win, result });
      } catch (err) {
        reject('Failed to parse response: ' + err.message);
      }
    });
  });
}

let winCount = 0;

let maxlossCount = 0;

let lossCount = 0;

let count = 1;

async function startMartingale() {
  while (true) {
    try {
      console.log(`Rolling with bet: ${currentBet.toFixed(2)} USDT`);
      const { win, result } = await rollDice(currentBet);

      console.log(count + ". " + `🎲 Rolled: ${result.toFixed(2)} | ${win ? "✅ WIN  🎉 Wins: " + winCount : "❌ LOSS"}`);

      if (win) {
        currentBet = baseBet; // Reset on win
        winCount++;
        lossCount = 0; // Reset loss count
        if(count > 30) {
        console.log("Stopping after 30 rolls.");
        break;
    }
      } else {
        currentBet *= 2; // Double on loss
        lossCount++;
        if(lossCount > maxlossCount){
            maxlossCount = lossCount; // Update max loss count
            console.log("🔥".repeat(maxlossCount) + ` Max loss streak updated: ${maxlossCount}`);
        }
      }

    count++;

    
      await new Promise(res => setTimeout(res, (Math.random()) * 10000)); // Random delay between 0 and 10 seconds
    } catch (err) {
      console.error("Error:", err);
      break;
    }
  }
}

startMartingale();
