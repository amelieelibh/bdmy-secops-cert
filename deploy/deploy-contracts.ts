import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
// import { HardhatUpgrades } from "@openzeppelin/hardhat-upgrades";

console.log("DeployFunction init");
const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, network, ethers } = hre;

  console.log("getNamedAccounts");
  const { deployer } = await getNamedAccounts();
  console.log("deployer", deployer);

  let medicsBookAddr: string | undefined;

  const chainId = network.config.chainId;
  console.log("chainId", chainId);
  const useProxy = !hre.network.live;
  console.log("useProxy", useProxy);
//   if (!useProxy) {
//     console.log("non proxy");
//     return;
//   }

  try {
    const resultDeploy = await deployments.deploy("MedicsBook", {
      from: deployer,
      // contract: 'MedicsBook',
      log: true,
      proxy: useProxy && {
        owner: deployer,
        methodName: "initialize",
      },
      args: [],
      gasLimit: 5500000,
      skipIfAlreadyDeployed: true,
    });
    medicsBookAddr = resultDeploy.address;
    console.log("result deploy MedicsBook", medicsBookAddr);
  } catch (err) {
    console.error("No se pudo desplegar el contrato MedicsBook", err);
  }

  if (!medicsBookAddr) {
    console.error("No se pudo desplegar el contrato MedicsBook");
    return;
  }
  try {
    const resultDeploy = await deployments.deploy("MedicineSupply", {
      from: deployer,
      // contract: 'MedicsBook',
      log: true,
      args: [medicsBookAddr],
      gasLimit: 5500000,
      skipIfAlreadyDeployed: true,
    });
    medicsBookAddr = resultDeploy.address;
    console.log("result deploy MedicineSupply", resultDeploy.address);
    const MedicineSupply = await ethers.getContractAt("MedicineSupply", resultDeploy.address);
    const init = await MedicineSupply.initializeMedicineSupply(medicsBookAddr);
    console.log("MedicineSupply initialized", init.hash);
  } catch (err) {
    console.error("No se pudo desplegar el contrato MedicineSupply", err);
  }
};
export default func;
func.id = "deploy-contracts";
func.tags = ["MedicsBook", "MedicineSupply"];
// func.runAtTheEnd = true;
