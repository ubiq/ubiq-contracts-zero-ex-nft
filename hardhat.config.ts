import { task } from "hardhat/config";
import "@nomiclabs/hardhat-waffle";
import 'hardhat-deploy';
import 'hardhat-abi-exporter';

import { HardhatUserConfig } from 'hardhat/config';

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(await account.address);
  }
});

function getMnemonic(networkName?: string): string {
  if (networkName) {
    const mnemonic = process.env['MNEMONIC_' + networkName.toUpperCase()];
    if (mnemonic && mnemonic !== '') {
      return mnemonic;
    }
  }

  const mnemonic = process.env.MNEMONIC;
  if (!mnemonic || mnemonic === '') {
    return 'test test test test test test test test test test test junk';
  }
  return mnemonic;
}

function accounts(networkName?: string): {mnemonic: string} {
  return {mnemonic: getMnemonic(networkName)};
}

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.5.9",
      },
      {
        version: "0.6.12",
        settings: {
          optimizer: {
            enabled: true,
            runs: 1000000,
            details: { yul: true, deduplicate: true, cse: true, constantOptimizer: true }
          },
          evmVersion: "istanbul",
        },
      },
    ],
  },
  networks: {
    localhost: {
      accounts: accounts(),
    },
    mainnet: {
      url: "http://127.0.0.1:8588",
      chainId: 8,
      gasPrice: 81000000000,
    },
  },
  namedAccounts: {
    deployer: {
      default: 0,
      "mainnet": '0xc5070A5CB93F4497240a57969485C0FbF5c2ee3A',
    },
    weth9ContractAddress: {
      "mainnet": '0x1FA6A37c64804C0D797bA6bC1955E50068FbF362',
    }
  },
  abiExporter: {
    path: './data/abi',
  }
};

export default config;
