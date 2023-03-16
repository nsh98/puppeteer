import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { getUserAgent } from "./helper/user-agents";
import { getRandomWallet, getBalance, transfer } from "./helper/ethers";
import delay from "delay";
import { ethers } from "ethers";

import { config } from "dotenv";
config();

puppeteer.use(StealthPlugin());

const main = async () => {
  const browser = await puppeteer.launch({ headless: true });
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
  console.log("[LOG] - balance:", balance);
  let index = 1;
  while (balance === 0) {
    console.log(`[${index}] ${balance}`);
    await delay(5000);
    balance = await getBalance(randomWallet.address);
    index++;
  }

  const mainAddress = process.env.MAIN_ADDRESS;
  const amount = ethers.parseEther("149");
  await transfer(randomWallet, mainAddress as string, amount);
  console.log("Done");
  await page.close();
};
(async () => {
  // for loop
  for (let i = 0; i < 10; i++) {
    await main();
  }
})();
