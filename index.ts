import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { getUserAgent } from "./helper/user-agents";
import { getRandomWallet, getBalance, transfer } from "./helper/ethers";
import delay from "delay";
import { ethers } from "ethers";

import { config } from "dotenv";
config();

puppeteer.use(StealthPlugin());

const main = async (browser: any) => {
  const page = await browser.newPage();
  const userAgent = getUserAgent();
  await page.setUserAgent(userAgent);

  const targetWebsite = process.env.TARGET_WEBSITE;
  await page.goto(targetWebsite as string);

  await page.waitForSelector(".Input__input");
  const randomWallet = getRandomWallet();
  await page.type(".Input__input", randomWallet.address);

  // do not focus the input
  await page.keyboard.press("Tab");

  // await the button with class KlayFaucet__button not disable
  await page.waitForSelector(".KlayFaucet__button:not([disabled])");

  const faucetButton = await page.$(".KlayFaucet__button");
  await faucetButton?.click();

  let balance = await getBalance(randomWallet.address);
  let index = 1;
  while (balance === "0") {
    console.log(`Balance is 0, try ${index} times`);
    balance = await getBalance(randomWallet.address);
    index++;
    await delay(5000);
    if (index > 5) {
      console.log("Balance is still 0, skip this address");
      return;
    }
  }
  const mainAddress = process.env.MAIN_ADDRESS;
  const amount = ethers.parseEther(`${150 - 0.01}`);
  const txHash = await transfer(randomWallet, mainAddress as string, amount);
  console.log("Transfer done at: ", txHash);

  await page.close();
};

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  for (let i = 0; i < 1000; i++) {
    await main(browser);
  }
  await browser.close();
})();
