import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { deployments } from 'hardhat';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {
    getNamedAccounts,
  } = hre;
  const zeroEx = await deployments.get('ZeroEx');
  const erc721OrdersFeature = await deployments.get('ERC721OrdersFeature');
  const erc1155OrdersFeature = await deployments.get('ERC1155OrdersFeature');
  const otcOrdersFeature = await deployments.get('OtcOrdersFeature');
  const erc165Feature = await deployments.get('ERC165Feature');
  const simpleFunctionRegistryFeature = await deployments.get('SimpleFunctionRegistryFeature');
  const ownableFeature = await deployments.get('OwnableFeature');
  let { deployer } = await getNamedAccounts();

  // Call InitialMigration.initializeZeroEx(yourAddress, zeroExAddress, {registry, ownable})
  await deployments.execute('InitialMigration', { from: deployer, log: true},
    'initializeZeroEx',
    deployer,
    zeroEx.address, 
    {
      registry: simpleFunctionRegistryFeature.address, 
      ownable: ownableFeature.address
    }
  );

  // Explicitly set the signer
  const signer = await hre.ethers.getSigner(deployer);
  const ownableFeatureContract = await hre.ethers.getContractAt("OwnableFeature", zeroEx.address, signer);
  const simpleFunctionRegistryFeatureContract = await hre.ethers.getContractAt("SimpleFunctionRegistryFeature", zeroEx.address, signer);

  // Depending on the ERC721/ERC1155 token that you're testing with, you may
  // need ERC165Feature. This contract doesn't have a migrate function, since
  // it only exposes a single function. Instead, you would call:
  // ZeroEx.extend(0x01ffc9a7, erc165Feature.address) to register the supportsInterface function.
  const erc165FeatureExtendTx = await simpleFunctionRegistryFeatureContract.extend(0x01ffc9a7, erc165Feature.address)
  console.log("executing ERC165Feature extend (tx: " + erc165FeatureExtendTx.hash + ")")

  // Now the migrate function is registered to the proxy. Call ZeroEx.migrate
  // for each feature contract (other than SimpleFunctionRegistryFeature and
  // OwnableFeature). This call will usually look like this:
  // ZeroEx.migrate(erc721OrdersFeature.address, 0x8fd3ab80, yourEOA)
  // Most features' migrate function don't take any arguments so we pass in
  // 0x8fd3ab80 as the second argument, which is the function selector for migrate().
  const erc721OrdersFeatureMigrateTx = await ownableFeatureContract.migrate(erc721OrdersFeature.address, 0x8fd3ab80, deployer);
  console.log("executing ERC721OrdersFeature migrate (tx: " + erc721OrdersFeatureMigrateTx.hash + ")")
  const erc1155OrdersFeatureMigrateTx = await ownableFeatureContract.migrate(erc1155OrdersFeature.address, 0x8fd3ab80, deployer);
  console.log("executing ERC1155OrdersFeature migrate (tx: " + erc1155OrdersFeatureMigrateTx.hash + ")")
  const otcOrdersFeatureMigrateTx = await ownableFeatureContract.migrate(otcOrdersFeature.address, 0x8fd3ab80, deployer);
  console.log("executing OtcOrdersFeature migrate (tx: " + otcOrdersFeatureMigrateTx.hash + ")")

  return true;
};

export default func;
func.tags = ['InitializeExtendMigrate'];
func.runAtTheEnd = true;
func.id = 'InitializeExtendMigrate';
func.dependencies = ['InitialMigration', 'ZeroEx', 'ERC721OrdersFeature',
  'ERC1155OrdersFeature', 'OtcOrdersFeature', 'ERC165Feature',
  'SimpleFunctionRegistryFeature', 'OwnableFeature'];

