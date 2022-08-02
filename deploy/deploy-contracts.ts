import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

console.log("DeployFunction init");
const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, network, ethers } = hre;

  console.log("getNamedAccounts");
  const { deployer } = await getNamedAccounts();
  console.log("deployer", deployer);

  let tokenAddress: string | undefined = undefined;

    try {
      const chainId = network.config.chainId;
      const resultDeploy = await deployments.deploy("ERC20", {
        from: deployer,
        // contract: 'ERC20',
        log: true,
        args: [],
        gasLimit: 5500000,
        skipIfAlreadyDeployed: true,
      });
      tokenAddress = resultDeploy.address;
      console.log("result deploy Token", tokenAddress);
    } catch (err) {
      console.error("No se pudo desplegar el contrato", err);
    }

};
export default func;
// func.runAtTheEnd = true;