import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {
    deployments: { deploy },
    getNamedAccounts,
  } = hre;
  let { deployer } = await getNamedAccounts();

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
  const wETH9 = await deploy('WETH9', {
    from: deployer,
    log: true,
  });

  // Deploy the feature contracts. In addition to ERC721OrdersFeature and
  // whatnot, you'll need SimpleFunctionRegistryFeature and OwnableFeature.
  await deploy('ERC721OrdersFeature', {
    from: deployer,
    args: [zeroEx.address, wETH9.address],
    log: true,
  });

  await deploy('ERC1155OrdersFeature', {
    from: deployer,
    args: [zeroEx.address, wETH9.address],
    log: true,
  });

  const simpleFunctionRegistryFeature = await deploy('SimpleFunctionRegistryFeature', {
    from: deployer,
    log: true,
  });
  
  const ownableFeature = await deploy('OwnableFeature', {
    from: deployer,
    log: true,
  });

  // Call InitialMigration.initializeZeroEx(yourAddress, zeroExAddress, {registry, ownable})
  const initialMigrationContract = await hre.ethers.getContractAt("InitialMigration", initialMigration.address);
  await initialMigrationContract.initializeZeroEx(deployer, 
    zeroEx.address, 
    {
      registry: simpleFunctionRegistryFeature.address, 
      ownable: ownableFeature.address
    });

};

export default func;
func.tags = ['InitialMigration', 'ZeroEx'];
