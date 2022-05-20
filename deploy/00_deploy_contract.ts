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
  const erc721OrdersFeature = await deploy('ERC721OrdersFeature', {
    from: deployer,
    args: [zeroEx.address, wETH9.address],
    log: true,
  });

  const erc1155OrdersFeature = await deploy('ERC1155OrdersFeature', {
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
  // Verify
  const zeroExContract = await hre.ethers.getContractAt("ZeroEx", zeroEx.address);
  // 0x261fe679
  // Function: migrate(address target, bytes data, address newOwner)
  const migrateFunctionContractAddress = await zeroExContract.getFunctionImplementation(0x261fe679);
  console.log("migrate function address " + migrateFunctionContractAddress + " correctly points to deployed OwnableFeature contract " + ownableFeature.address)

  // Now the migrate function is registered to the proxy. Call ZeroEx.migrate
  // for each feature contract (other than SimpleFunctionRegistryFeature and
  // OwnableFeature). This call will usually look like this:
  // ZeroEx.migrate(erc721OrdersFeature.address, 0x8fd3ab80, yourEOA)
  // Most features' migrate function don't take any arguments so we pass in
  // 0x8fd3ab80 as the second argument, which is the function selector for migrate().
  const ownableFeatureContract = await hre.ethers.getContractAt("OwnableFeature", zeroEx.address);
  await ownableFeatureContract.migrate(erc721OrdersFeature.address, 0x8fd3ab80, deployer);
  await ownableFeatureContract.migrate(erc1155OrdersFeature.address, 0x8fd3ab80, deployer);



};

export default func;
func.tags = ['InitialMigration', 'ZeroEx'];
