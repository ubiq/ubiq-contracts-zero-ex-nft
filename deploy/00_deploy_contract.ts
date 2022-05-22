import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { network } from 'hardhat';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {
    deployments: { deploy },
    getNamedAccounts,
  } = hre;
  let { deployer, weth9ContractAddress } = await getNamedAccounts();

  // Deploy the InitialMigration contract. In the constructor, you can use
  // your EOA as the initializeCaller_.
  const initialMigration = await deploy('InitialMigration', {
    from: deployer,
    args: [deployer],
    log: true,
  });

  // Deploy ZeroEx contract. In the constructor, use the InitialMigration
  // contract address as the bootstrapper.
  const zeroEx = await deploy('ZeroEx', {
    from: deployer,
    args: [initialMigration.address],
    log: true,
  });

  // WETH9 is used as a constructor value
  if (network.name === "localhost" || network.name === "hardhat") {
    const wETH9 = await deploy('WETH9', {
      from: deployer,
      log: true,
    });
    weth9ContractAddress = wETH9.address;
  };

  // Deploy the feature contracts. In addition to ERC721OrdersFeature and
  // whatnot, you'll need SimpleFunctionRegistryFeature and OwnableFeature.
  await deploy('ERC721OrdersFeature', {
    from: deployer,
    args: [zeroEx.address, weth9ContractAddress],
    log: true,
  });

  await deploy('ERC1155OrdersFeature', {
    from: deployer,
    args: [zeroEx.address, weth9ContractAddress],
    log: true,
  });

  await deploy('OtcOrdersFeature', {
    from: deployer,
    args: [zeroEx.address, weth9ContractAddress],
    log: true,
  });

  await deploy('ERC165Feature', {
    from: deployer,
    log: true,
  });

  await deploy('SimpleFunctionRegistryFeature', {
    from: deployer,
    log: true,
  });
  
  await deploy('OwnableFeature', {
    from: deployer,
    log: true,
  });
};

export default func;
func.tags = ['InitialMigration', 'ZeroEx', 'ERC721OrdersFeature',
  'ERC1155OrdersFeature', 'OtcOrdersFeature', 'ERC165Feature',
  'SimpleFunctionRegistryFeature', 'OwnableFeature'];
