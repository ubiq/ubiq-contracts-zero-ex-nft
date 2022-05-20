import { task } from "hardhat/config";
import "@nomiclabs/hardhat-waffle";
import 'hardhat-deploy';

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
        version: "0.6.5",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
  networks: {
    localhost: {
      accounts: accounts(),
    },
  },
  namedAccounts: {
    deployer: {
      default: 0,
    }
  }
};

export default config;
