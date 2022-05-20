import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {
    deployments: { deploy },
    getNamedAccounts,
  } = hre;
  let { deployer } = await getNamedAccounts();

  await deploy('InitialMigration', {
    from: deployer,
    args: [deployer],
    log: true,
  });
};

export default func;
func.tags = ['InitialMigration'];
