import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";
import { MedicineSupply, MedicsBook } from "../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber, BigNumberish } from "ethers";

describe("MedicineSupply", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshopt in every test.
  async function deployOneYearLockFixture(): Promise<{
    medicineSupply: MedicineSupply;
    medicsBook: MedicsBook;
    owner: SignerWithAddress;
    hospital1: SignerWithAddress;
    hospital2: SignerWithAddress;
    medic1: SignerWithAddress;
    medic2: SignerWithAddress;
    medic3: SignerWithAddress;
    patient1: SignerWithAddress;
    patient2: SignerWithAddress;
    patient3: SignerWithAddress;
    patient4: SignerWithAddress;
  }> {
    const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60;
    const ONE_GWEI = 1_000_000_000;

    // Contracts are deployed using the first signer/account by default
    const [owner, hospital1, hospital2, medic1, medic2, medic3, patient1, patient2, patient3, patient4] = await ethers.getSigners();
    console.log("owner", owner.address);
    const MedicsBookFactory = await ethers.getContractFactory("MedicsBook");
    const medicsBook = await MedicsBookFactory.deploy() ;

    const MedicineSupplyFactory = await ethers.getContractFactory("MedicineSupply");
    const medicineSupply = await MedicineSupplyFactory.deploy(medicsBook.address);
    await medicineSupply.initializeMedicineSupply(medicsBook.address);

    return { medicsBook, medicineSupply,
      owner, hospital1, hospital2, medic1, medic2, medic3, patient1, patient2, patient3, patient4
     };
  }

  describe("MedicsBook", function () {
    let medicsBook: MedicsBook;
    let medic1: SignerWithAddress;
    let medic2: SignerWithAddress;
    let medic3: SignerWithAddress;
    
    it("should add a medic", async function () {
      const state = await loadFixture(deployOneYearLockFixture);
      medicsBook = state.medicsBook;
      medic1 = state.medic1; 
      medic2 = state.medic2;
      medic3 = state.medic3;
      await medicsBook.connect(medic1).addMedic("Juan Perez", "https://drjuanperez.com");
      const drsCount = await medicsBook.getDoctorsCount();
      expect(drsCount).to.be.equal(1);
      const drData = await medicsBook.getMedic(medic1.address);
      expect(drData.name).to.be.equal("Juan Perez");
      expect(drData.url).to.be.equal("https://drjuanperez.com");
      expect(drData.addr).to.be.equal(medic1.address);
    });

    it("should add another doctor", async () => {
      await medicsBook.connect(medic2).addMedic("Ana Hernandez", "https://dranahernandez.org");
      const drsCount = await medicsBook.getDoctorsCount();
      expect(drsCount).to.be.equal(2);
      const drData = await medicsBook.getMedic(medic2.address);
      expect(drData.name).to.be.equal("Ana Hernandez");
      expect(drData.url).to.be.equal("https://dranahernandez.org");
      expect(drData.addr).to.be.equal(medic2.address);
    });

    it("should be able to update Medic's data", async () => {
      await medicsBook.connect(medic1).updateMedic("Juan Perez S.", "https://drjuanperez.com/new");
      const drData = await medicsBook.getMedic(medic1.address);
      expect(drData.name).to.be.equal("Juan Perez S.");
      expect(drData.url).to.be.equal("https://drjuanperez.com/new");
      expect(drData.addr).to.be.equal(medic1.address);
    });

    it("should not be able to update medic's data if not created yet", async () => {
      let err: any;
      try{
        await medicsBook.connect(medic3).updateMedic("Ale Vale", "https://myhospital.com/alevale");
      }catch(e: any){
        err = e;
      }
      expect(err).to.be.not.undefined;
      expect(err.message).to.contains("Only medic can call this function");
    });

    it("medic should exists", async () => {
      const exists = await medicsBook.existMedic(medic1.address);
      expect(exists).to.be.true;
    });

    it("should be able to get doctors by page", async () => {
      await medicsBook.connect(medic3).addMedic("Ale Vale", "https://myhospital.com/alevale");
      const doctorsPage1 = await medicsBook.getDoctors(1, 2);
      console.log("doctorsPage1", doctorsPage1);
      expect(doctorsPage1.length).to.be.equal(2);
      expect(doctorsPage1[0]).to.be.equal(medic1.address);
      expect(doctorsPage1[1]).to.be.equal(medic2.address);
      const doctorsPage2 = await medicsBook.getDoctors(2, 2);
      console.log("doctorsPage2", doctorsPage2);
      expect(doctorsPage2.length).to.be.equal(1);
      expect(doctorsPage2[0]).to.be.equal(medic3.address);
    });
  });

  describe("MedicineSupply Deployment", function () {
    it("Should have the medicians' book properly set", async function () {
      const { medicsBook, medicineSupply } = await loadFixture(deployOneYearLockFixture);

      expect(await medicineSupply.medicsBook()).to.equal(medicsBook.address);
    });
  });

  describe("MedicineSupply Hospitals", function () {
    let medicineSupply: MedicineSupply;
    let owner: SignerWithAddress;
    let h1: SignerWithAddress;
    let h2: SignerWithAddress;
    it("Should be able to add a hospital", async function () {
      const { medicineSupply: medicineSupplySC, owner: o, hospital1, hospital2 } = await loadFixture(deployOneYearLockFixture);
      medicineSupply = medicineSupplySC;
      h1 = hospital1;
      h2 = hospital2;
      owner = o;
      await medicineSupply.connect(owner).addHospital(hospital1.address, "Hospital 1", "https://hospital1.com");
      const hospitalsCount = await medicineSupply.getHospitalCount();
      expect(hospitalsCount).to.be.equal(1);
      const hospitalData = await medicineSupply.getHospital(hospital1.address);
      expect(hospitalData.name).to.be.equal("Hospital 1");
      expect(hospitalData.url).to.be.equal("https://hospital1.com");
      expect(hospitalData.addr).to.be.equal(hospital1.address);
    });

    it("Should be able to add another hospital", async function () {
      await medicineSupply.connect(owner).addHospital(h2.address, "Hospital 2", "https://hospital2.com");
      const hospitalsCount = await medicineSupply.getHospitalCount();
      expect(hospitalsCount).to.be.equal(2);
    });

    it("should be able to remove hospital 1", async function () {
      await medicineSupply.connect(owner).removeHospital(h1.address, "just for testing");
      const hospitalsCount = await medicineSupply.getHospitalCount();
      expect(hospitalsCount).to.be.equal(1);
      const hospitalData = await medicineSupply.getHospital(h2.address);
      expect(hospitalData.name).to.be.equal("Hospital 2");
      expect(hospitalData.url).to.be.equal("https://hospital2.com");
      expect(hospitalData.addr).to.be.equal(h2.address);
      const hospitalInList = await medicineSupply.hospitalsList(0);
      expect(hospitalInList).to.be.equal(h2.address);
    });
  });

  describe("Managing Medics of Hospitals", function (){
    let fixture: {
      medicineSupply: MedicineSupply;
      medicsBook: MedicsBook;
      owner: SignerWithAddress;
      hospital1: SignerWithAddress;
      hospital2: SignerWithAddress;
      medic1: SignerWithAddress;
      medic2: SignerWithAddress;
      medic3: SignerWithAddress;
      patient1: SignerWithAddress;
      patient2: SignerWithAddress;
      patient3: SignerWithAddress;
      patient4: SignerWithAddress;
    };
    beforeEach(async () => {
      fixture = await loadFixture(deployOneYearLockFixture);
      const { medicineSupply, medicsBook, owner, hospital1, hospital2, medic1, medic2, medic3 } = fixture;
      await medicineSupply.connect(owner).addHospital(hospital1.address, "Hospital 1", "https://hospital1.com");
      await medicineSupply.connect(owner).addHospital(hospital2.address, "Hospital 2", "https://hospital2.com");
      await medicsBook.connect(medic1).addMedic("Juan Perez", "https://drjuanperez.com");
      await medicsBook.connect(medic2).addMedic("Ana Hernandez", "https://dranahernandez.org");
      await medicsBook.connect(medic3).addMedic("Ale Vale", "https://myhospital.com/alevale");
    });

    it("should be able to add medics to hospital", async function () {
      const { medicineSupply, medicsBook, hospital1, medic1 } = fixture;
      const addMedicResponse = await medicineSupply.connect(hospital1).addMedic(medic1.address);
      const addMedicResult = await addMedicResponse.wait();
      expect(addMedicResult.events?.[0]?.event).to.be.equal("MedicAdded");
      expect(addMedicResult.events?.[0]?.args?.hospitalAddr).to.be.equal(hospital1.address);
      expect(addMedicResult.events?.[0]?.args?.medicAddr).to.be.equal(medic1.address);
      const medicData = await medicsBook.getMedic(medic1.address);
      expect(addMedicResult.events?.[0]?.args?.medicAddr).to.be.equal(medicData.addr);
      expect(addMedicResult.events?.[0]?.args?.name).to.be.equal(medicData.name);
      expect(addMedicResult.events?.[0]?.args?.url).to.be.equal(medicData.url);
      const isMedic1InHospital1 = await medicineSupply.medicsInHospitals(hospital1.address, medic1.address);
      // console.log("isMedic1InHospital1", isMedic1InHospital1);
    });

    it("should be able to add same medician to two hospitals", async function () {
      const { medicineSupply, hospital1, hospital2, medic2 } = fixture;
      await medicineSupply.connect(hospital1).addMedic(medic2.address);
      await medicineSupply.connect(hospital2).addMedic(medic2.address);
      const medic2InHospital1 = await medicineSupply.medicsInHospitals(hospital1.address, medic2.address);
      const medic2InHospital2 = await medicineSupply.medicsInHospitals(hospital2.address, medic2.address);
      expect(medic2InHospital1).to.be.true;
      expect(medic2InHospital2).to.be.true;
    });
    
    it("should be able to remove medic 2 from hospital 2", async function () {
      const { medicineSupply, hospital1, medic2 } = fixture;
      await medicineSupply.connect(hospital1).addMedic(medic2.address);
      await medicineSupply.connect(hospital1).removeMedic(medic2.address);
      const medic2InHospital1 = await medicineSupply.medicsInHospitals(hospital1.address, medic2.address);
      expect(medic2InHospital1).to.be.false;
    });
  });

  describe("Managing Medicines of Hospitals", function (){
    let fixture: {
      medicineSupply: MedicineSupply;
      medicsBook: MedicsBook;
      owner: SignerWithAddress;
      hospital1: SignerWithAddress;
      hospital2: SignerWithAddress;
      medic1: SignerWithAddress;
      medic2: SignerWithAddress;
      medic3: SignerWithAddress;
      patient1: SignerWithAddress;
      patient2: SignerWithAddress;
      patient3: SignerWithAddress;
      patient4: SignerWithAddress;
    };
    before(async () => {
      fixture = await loadFixture(deployOneYearLockFixture);
      const { medicineSupply, medicsBook, owner, hospital1, hospital2, medic1, medic2, medic3 } = fixture;
      await medicineSupply.connect(owner).addHospital(hospital1.address, "Hospital 1", "https://hospital1.com");
      await medicineSupply.connect(owner).addHospital(hospital2.address, "Hospital 2", "https://hospital2.com");
      await medicsBook.connect(medic1).addMedic("Juan Perez", "https://drjuanperez.com");
      await medicsBook.connect(medic2).addMedic("Ana Hernandez", "https://dranahernandez.org");
      // await medicsBook.connect(medic3).addMedic("Ale Vale", "https://myhospital.com/alevale");
      await medicineSupply.connect(hospital1).addMedic(medic1.address);
      await medicineSupply.connect(hospital1).addMedic(medic2.address);
      await medicineSupply.connect(hospital2).addMedic(medic2.address);
    });

    it("should be able to register a new medicine in hospital 1", async function () {
      const { medicineSupply, hospital1 } = fixture;
      const medicineName = "paracetamol";
      const sku = ethers.utils.formatBytes32String(medicineName);
      const medicinePrice = 100;
      const addMedicineResponse = await medicineSupply.connect(hospital1).registerMedicine(
          sku, "paracetamol", medicinePrice);
      const addMedicineResult = await addMedicineResponse.wait();
      expect(addMedicineResult.events?.[0]?.event).to.be.equal("NewMedicine");
      expect(addMedicineResult.events?.[0]?.args?.hospitalAddr).to.be.equal(hospital1.address);
      expect(addMedicineResult.events?.[0]?.args?.sku).to.be.equal(sku);
      expect(addMedicineResult.events?.[0]?.args?.name).to.be.equal(medicineName);
      expect(addMedicineResult.events?.[0]?.args?.price).to.be.equal(medicinePrice);
      const medicineData = await medicineSupply.medicines(hospital1.address, sku);
      // console.log("medicineData", medicineData);
      expect(medicineData.sku).to.be.equal(sku);
      expect(medicineData.name).to.be.equal(medicineName);
      expect(medicineData.price).to.be.equal(medicinePrice);
      expect(medicineData.quantity).to.be.equal(0);
    });

    it("should be able to register a new medicine in hospital 2", async function () {
      const { medicineSupply, hospital2 } = fixture;
      const medicineName = "paracetamol";
      const sku = ethers.utils.formatBytes32String(medicineName);
      const medicinePrice = 100;
      const addMedicineResponse = await medicineSupply.connect(hospital2).registerMedicine(
          sku, "paracetamol", medicinePrice);
      const addMedicineResult = await addMedicineResponse.wait();
      expect(addMedicineResult.events?.[0]?.event).to.be.equal("NewMedicine");
      expect(addMedicineResult.events?.[0]?.args?.hospitalAddr).to.be.equal(hospital2.address);
      expect(addMedicineResult.events?.[0]?.args?.sku).to.be.equal(sku);
      expect(addMedicineResult.events?.[0]?.args?.name).to.be.equal(medicineName);
      expect(addMedicineResult.events?.[0]?.args?.price).to.be.equal(medicinePrice);
    });

    it("should be able to buy/add an existing medicine in hospital 1", async function () {
      const { medicineSupply, hospital1 } = fixture;
      const medicineName = "paracetamol";
      const sku = ethers.utils.formatBytes32String(medicineName);
      const qty = 500;
      const buyMedicineResponse = await medicineSupply.connect(hospital1).addMedicines(
          [sku], [qty]);
      const buyMedicineResult = await buyMedicineResponse.wait();
      expect(buyMedicineResult.events?.[0]?.event).to.be.equal("BoughtMedicine");
      expect(buyMedicineResult.events?.[0]?.args?.hospitalAddr).to.be.equal(hospital1.address);
      expect(buyMedicineResult.events?.[0]?.args?.sku).to.be.equal(sku);
      expect(buyMedicineResult.events?.[0]?.args?.quantity).to.be.equal(qty);
      const medicineData = await medicineSupply.medicines(hospital1.address, sku);
      // console.log("medicineData", medicineData);
      expect(medicineData.sku).to.be.equal(sku);
      expect(medicineData.name).to.be.equal(medicineName);
      expect(medicineData.quantity).to.be.equal(qty);
    });

    it("should be able to add more to an existing medicine in hospital 1", async function () {
      const { medicineSupply, hospital1 } = fixture;
      const medicineName = "paracetamol";
      const sku = ethers.utils.formatBytes32String(medicineName);
      const qty = 500;
      const buyMedicineResponse = await medicineSupply.connect(hospital1).addMedicines(
          [sku], [qty]);
      const buyMedicineResult = await buyMedicineResponse.wait();
      expect(buyMedicineResult.events?.[0]?.event).to.be.equal("BoughtMedicine");
      expect(buyMedicineResult.events?.[0]?.args?.hospitalAddr).to.be.equal(hospital1.address);
      expect(buyMedicineResult.events?.[0]?.args?.sku).to.be.equal(sku);
      expect(buyMedicineResult.events?.[0]?.args?.quantity).to.be.equal(qty);
      const medicineData = await medicineSupply.medicines(hospital1.address, sku);
      // console.log("medicineData", medicineData);
      expect(medicineData.sku).to.be.equal(sku);
      expect(medicineData.name).to.be.equal(medicineName);
      expect(medicineData.quantity).to.be.equal(qty*2);
    });

    it("should be able to register new medicines to hospital 2", async () => {
      const { medicineSupply, hospital2 } = fixture;
      const medicineName1 = "ibuprofeno";
      const sku1 = ethers.utils.formatBytes32String(medicineName1);
      const medicine1Price = 100;

      const medicineName2 = "omeprazol";
      const sku2 = ethers.utils.formatBytes32String(medicineName2);
      const medicine2Price = 200;

      await medicineSupply.connect(hospital2).registerMedicine(
          sku1, medicineName1, medicine1Price);
      await medicineSupply.connect(hospital2).registerMedicine(
          sku2, medicineName2, medicine2Price);
    });

    it("should be able to add multiple existing medicines to hospital2", async () => {
      const { medicineSupply, hospital2 } = fixture;
      const medicineName1 = "ibuprofeno";
      const sku1 = ethers.utils.formatBytes32String(medicineName1);
      const qty1 = 500;

      const medicineName2 = "omeprazol";
      const sku2 = ethers.utils.formatBytes32String(medicineName2);
      const qty2 = 1000;

      await medicineSupply.connect(hospital2).addMedicines(
          [sku1, sku2], [qty1, qty2]);
      const medicineData1 = await medicineSupply.medicines(hospital2.address, sku1);
      const medicineData2 = await medicineSupply.medicines(hospital2.address, sku2);
      expect(medicineData1.sku).to.be.equal(sku1);
      expect(medicineData1.quantity).to.be.equal(qty1);
      expect(medicineData2.sku).to.be.equal(sku2);
      expect(medicineData2.quantity).to.be.equal(qty2);
    });

  });


  describe("Managing Medicines of Hospitals", function (){
    let fixture: {
      medicineSupply: MedicineSupply;
      medicsBook: MedicsBook;
      owner: SignerWithAddress;
      hospital1: SignerWithAddress;
      hospital2: SignerWithAddress;
      medic1: SignerWithAddress;
      medic2: SignerWithAddress;
      medic3: SignerWithAddress;
      patient1: SignerWithAddress;
      patient2: SignerWithAddress;
      patient3: SignerWithAddress;
      patient4: SignerWithAddress;
    };
    before(async () => {
      fixture = await loadFixture(deployOneYearLockFixture);
      const { medicineSupply, medicsBook, owner, hospital1, hospital2, medic1, medic2, medic3 } = fixture;
      await medicineSupply.connect(owner).addHospital(hospital1.address, "Hospital 1", "https://hospital1.com");
      await medicineSupply.connect(owner).addHospital(hospital2.address, "Hospital 2", "https://hospital2.com");
      await medicsBook.connect(medic1).addMedic("Juan Perez", "https://drjuanperez.com");
      await medicsBook.connect(medic2).addMedic("Ana Hernandez", "https://dranahernandez.org");
      // await medicsBook.connect(medic3).addMedic("Ale Vale", "https://myhospital.com/alevale");
      await medicineSupply.connect(hospital1).addMedic(medic1.address);
      await medicineSupply.connect(hospital1).addMedic(medic2.address);
      await medicineSupply.connect(hospital2).addMedic(medic2.address);
      const medicine1 = "paracetamol";
      const sku1 = ethers.utils.formatBytes32String(medicine1);
      const medicine1Price = 100;
      const qty1 = 500;
      const medicine2 = "omeprazol";
      const sku2 = ethers.utils.formatBytes32String(medicine2);
      const medicine2Price = 200;
      const qty2 = 1000;
      const medicine3 = "ibuprofeno";
      const sku3 = ethers.utils.formatBytes32String(medicine3);
      const medicine3Price = 300;
      const qty3 = 5;
      await medicineSupply.connect(hospital1).registerMedicine(sku1, medicine1, medicine1Price);
      await medicineSupply.connect(hospital1).registerMedicine(sku2, medicine2, medicine2Price);
      await medicineSupply.connect(hospital1).addMedicines([sku1, sku2], [qty1, qty2]);
      await medicineSupply.connect(hospital2).registerMedicine(sku2, medicine2, medicine2Price);
      await medicineSupply.connect(hospital2).registerMedicine(sku3, medicine3, medicine3Price);
      await medicineSupply.connect(hospital2).addMedicines([sku2, sku3], [qty2, qty3]);
    });
    let prescriptionId: BigNumberish = 0;
    it("medic1 in hospital1 should be able to create a new prescription to patient1", async () => {
      const { medicineSupply, hospital1, medic1, patient1 } = fixture;
      const medicine1Name = "paracetamol";
      const sku1 = ethers.utils.formatBytes32String(medicine1Name);
      const qty1 = 2;
      const medicine2Name = "omeprazol";
      const sku2 = ethers.utils.formatBytes32String(medicine2Name);
      const qty2 = 3;
      const prescription = await medicineSupply.connect(medic1).createPrescription(
          hospital1.address, patient1.address, [sku1, sku2], [qty1, qty2]);
      const prescriptionResult = await prescription.wait();
      expect(prescriptionResult.events?.[0].event).to.be.equal("NewPrescription");
      expect(prescriptionResult.events?.[0].args?.hospitalAddr).to.be.equal(hospital1.address);
      expect(prescriptionResult.events?.[0].args?.medicAddr).to.be.equal(medic1.address);
      expect(prescriptionResult.events?.[0].args?.patientAddr).to.be.equal(patient1.address);
      prescriptionId = prescriptionResult.events?.[0].args?.prescriptionId;
      expect(prescriptionId).to.be.not.null;

      const prescriptionData = await medicineSupply.prescriptions(prescriptionId);
      expect(prescriptionData.medic).to.be.equal(medic1.address);
      expect(prescriptionData.hospital).to.be.equal(hospital1.address);
      expect(prescriptionData.patient).to.be.equal(patient1.address);
      // expect(prescriptionData.).to.be.equal(sku);
      expect(prescriptionData.filledStatus).to.be.equal("0x01");
      // console.log("prescriptionData", prescriptionData);
    });

    it("patient1 must able to request medicines by prescriptionId from hospital1 given by medic1", async () => {
      const { medicineSupply, hospital1, medic1, patient1 } = fixture;
      const prescription = await medicineSupply.connect(patient1).prescriptions(prescriptionId);
      // console.log("prescription", prescription);
      expect(prescription.medic).to.be.equal(medic1.address);
      expect(prescription.hospital).to.be.equal(hospital1.address);
      expect(prescription.filledStatus).to.be.equal("0x01");

      const requestResponse = await medicineSupply.connect(patient1).requestMedicines(prescriptionId);
      const requestResult = await requestResponse.wait();

      const updatedPrescription = await medicineSupply.connect(patient1).prescriptions(prescriptionId);
      expect(updatedPrescription.filledStatus).to.be.equal("0x02");

      const fillPrescriptionResponse = await medicineSupply.connect(hospital1).fillPrescription(prescriptionId);
      const fillPrescriptionResult = await fillPrescriptionResponse.wait();
      // console.log("fillPrescriptionResult", fillPrescriptionResult);
      const itemsOfPrescription = await medicineSupply.getItemsOfPrescription(prescriptionId);
      // console.log("itemsOfPrescription", itemsOfPrescription);
      expect(fillPrescriptionResult.events?.[0].event).to.be.equal("SoldMedicine");
      expect(fillPrescriptionResult.events?.[0].args?.sku).to.be.equal(itemsOfPrescription[0].sku);
      expect(fillPrescriptionResult.events?.[1].event).to.be.equal("SoldMedicine");
      expect(fillPrescriptionResult.events?.[1].args?.sku).to.be.equal(itemsOfPrescription[1].sku);
      expect(fillPrescriptionResult.events?.[2].event).to.be.equal("PrescriptionFilled");
      expect(fillPrescriptionResult.events?.[2].args?.hospitalAddr).to.be.equal(hospital1.address);
      expect(fillPrescriptionResult.events?.[2].args?.prescriptionId).to.be.equal(prescriptionId);
    });
  
    it("medic2 in hospital2 should be able to create a new prescription to patient2 but then the prescription expires", async () => {
      const { medicineSupply, hospital2, medic2, patient2 } = fixture;
      const medicine1Name = "ibuprofeno";
      const sku1 = ethers.utils.formatBytes32String(medicine1Name);
      const qty1 = 4;
      const medicine2Name = "omeprazol";
      const sku2 = ethers.utils.formatBytes32String(medicine2Name);
      const qty2 = 5;
      const prescription = await medicineSupply.connect(medic2).createPrescription(
        hospital2.address, patient2.address, [sku1, sku2], [qty1, qty2]);
      const prescriptionResult = await prescription.wait();
      prescriptionId = prescriptionResult.events?.[0].args?.prescriptionId;
      expect(prescriptionId).to.be.not.null;
      
      await time.increaseTo((await ethers.provider.getBlock(prescriptionResult.blockNumber)).timestamp + 60 * 60 * 24 * 31);
      
      const requestResponse = await medicineSupply.connect(patient2).requestMedicines(prescriptionId);
      const requestResult = await requestResponse.wait();
      
      expect(requestResult.events?.[0].event).to.be.equal("ExpiredPrescription");
      expect(requestResult.events?.[0].args?.hospitalAddr).to.be.equal(hospital2.address);
      expect(requestResult.events?.[0].args?.prescriptionId).to.be.equal(prescriptionId);
      
      const prescriptionData = await medicineSupply.prescriptions(prescriptionId);
      expect(prescriptionData.filledStatus).to.be.equal("0x05");
    });

    it("medic2 in hospital2 should be able to create a new prescription with ibuprofeno but then is empty and cannot request it", async () => {
      const { medicineSupply, hospital2, medic2, patient2 } = fixture;
      const medicine1Name = "ibuprofeno";
      const sku1 = ethers.utils.formatBytes32String(medicine1Name);
      const qty1 = 6;

      const prescription = await medicineSupply.connect(medic2).createPrescription(
        hospital2.address, patient2.address, [sku1], [qty1]);
      const prescriptionResult = await prescription.wait();
      const prescriptionId = prescriptionResult.events?.[0].args?.prescriptionId;
      expect(prescriptionId).to.be.not.null;

      let err: any;
      try{
        const requestResponse = await medicineSupply.connect(patient2).requestMedicines(prescriptionId);
        const requestResult = await requestResponse.wait();
        console.log("requestResult", requestResult);
        // expect(requestResult.events?.[0].event).to.be.equal("EmptyPrescription");
        // expect(requestResult.events?.[0].args?.hospitalAddr).to.be.equal(hospital2.address);
        // expect(requestResult.events?.[0].args?.sku).to.be.equal(sku1);
        // expect(requestResult.events?.[0].args?.name).to.be.equal(medicine1Name);
      }catch(e: any){
        err = e;
        // console.log("err", err);
      }
      expect(err).to.be.not.undefined;
      expect(err.message).to.contains("Not enough medicine at this moment");

    });
  });
});
