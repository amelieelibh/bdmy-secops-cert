import { HardhatUserConfig, task } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-deploy";


import dotenv from 'dotenv';
import dotenvExpand from 'dotenv-expand';
import { HardhatNetworkHDAccountsUserConfig, HttpNetworkAccountsUserConfig } from "hardhat/types";
var myEnv = dotenv.config();
dotenvExpand.expand(myEnv);

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();
  for (const account of accounts) {
    console.log(account.address);
  }
});
const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  solidity: {
    version: "0.8.9",
    compilers: [{ version: "0.8.9", settings: {} }],
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545"
    },
    rinkeby: {
      chainId: 4,
      url: `https://rinkeby.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
      accounts: { mnemonic: process.env.MNEMONIC } as HttpNetworkAccountsUserConfig
    },
    // mainnet: {
    //   url: `https://mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
    //   accounts: { mnemonic: process.env.PROD_MNEMONIC }
    //   // accounts: [privateKey1, privateKey2, ...]
    // },
    // polygondev: {
    //   url: "https://rpc-mumbai.matic.today",
    //   chainId: 80001,
    //   gasPrice: 20000000000,
    //   accounts: { mnemonic: process.env.DEV_MNEMONIC }
    // },
    // polygonSecondary: {
    //   url: "https://polygon-mainnet.infura.io/v3/" + process.env.INFURA_PROJECT_ID,
    //   // url: "https://rpc-mainnet.maticvigil.com",
    //   chainId: 137,
    //   gasPrice: 1100000000000,
    //   accounts: { mnemonic: process.env.PROD_MNEMONIC }
    // },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  namedAccounts: {
    deployer: 0,
    simpleERC20Beneficiary: 1,
  },
  typechain: {
    outDir: './typechain-types',
    target: 'ethers-v5',
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
    // react: "./App/hardhat",
    deployments: "./deployments/",
  },
  mocha: {
    timeout: 20000
  },
};

export default config;
