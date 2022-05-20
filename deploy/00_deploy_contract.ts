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
  await deploy('ZeroEx', {
    from: deployer,
    args: [initialMigration.address],
    log: true,
  });

  // Deploy the feature contracts. In addition to ERC721OrdersFeature and
  // whatnot, you'll need SimpleFunctionRegistryFeature and OwnableFeature.

};

export default func;
func.tags = ['InitialMigration', 'ZeroEx'];
