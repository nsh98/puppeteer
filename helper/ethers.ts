import { ethers } from "ethers";
import { HDNodeWallet } from "ethers";
import { config } from "dotenv";
import axios from "axios";
config();

export const getProvider = () => {
  return new ethers.JsonRpcProvider(process.env.RPC_URL);
};

export const getRandomWallet = () => {
  return ethers.Wallet.createRandom();
};

export const getBalance = async (address: string) => {
  const res = await axios.get(
    `https://api-baobab.wallet.klaytn.com/faucet/balance?address=${address}`
  );
  return +res.data.data;
};

export const transfer = async (
  senderWallet: HDNodeWallet,
  receiverAddress: string,
  amount: bigint
): Promise<string> => {
  const provider = getProvider();
  const tx = await senderWallet.connect(provider).sendTransaction({
    to: receiverAddress,
    value: amount,
  });
  return tx.hash;
};
