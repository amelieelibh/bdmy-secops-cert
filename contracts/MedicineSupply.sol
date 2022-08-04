// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;


import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "hardhat/console.sol";

struct Medic{
    address addr;
    string name;
    string url;
}

struct Medicine{
    bytes32 sku;
    string name;
    uint16 price;
    uint16 quantity;
}

struct Hospital{
    address addr;
    string name;
    string url;
}

struct Prescription{
    address medic;
    address hospital;
    address patient;
    ItemPrescription[] items;
    /**
        0x00 = cancelled
        0x01 = pending
        0x02 = requested
        0x03 = completed
        0x05 = expired
     */
    bytes1 filledStatus;
    uint timestamp;
}

struct ItemPrescription{
    bytes32 sku;
    uint16 quantity;
}

interface IMedicsBook{
    function getMedic(address _medic) external view returns (Medic memory);
    function existMedic(address _medic) external view returns (bool);
}

contract MedicineSupply is Initializable, ERC721Upgradeable, PausableUpgradeable, OwnableUpgradeable{

    mapping(address => Hospital) hospitals;
    address[] public hospitalsList;

    mapping(address => mapping(address => bool)) public medicsInHospitals;

    /** Medicines in Hospital - address of Hospital mapped to medicines by name */
    mapping(address => mapping(bytes32 => Medicine)) public medicines;

    IMedicsBook public medicsBook;

    uint public prescriptionsCount;
    // mapping hospital to medic to patient address to list of prescription ids
    mapping(address => mapping(address => mapping(address => uint[]))) public patientPrescriptions;
    // mapping prescription id to prescription
    mapping(uint => Prescription) public prescriptions;

    uint constant public MAX_IDLE = 60 * 60 * 24 * 30; // 30 days


    event NewHospital(address indexed hospitalAddr, string name, string url);
    event HopitalRemoved(address indexed hospitalAddr, string reason);

    event MedicAdded(address indexed hospitalAddr, address indexed medicAddr, string name, string url);
    event MedicRemoved(address indexed hospitalAddr, address indexed medicAddr);

    event NewMedicine(address indexed hospitalAddr, bytes32 indexed sku, string name, uint16 price);
    event BoughtMedicine(address indexed hospitalAddr, bytes32 indexed sku, uint16 quantity);
    event SoldMedicine(address indexed hospitalAddr, bytes32 indexed sku, uint16 quantity);
    event EmptyMedicine(address indexed hospitalAddr, bytes32 indexed sku, string name);

    event NewPrescription(address indexed hospitalAddr, address indexed medicAddr, address indexed patientAddr, uint prescriptionId);
    event ExpiredPrescription(address indexed hospitalAddr, uint prescriptionId);
    event PrescriptionFilled(address indexed hospitalAddr, uint prescriptionId);

    modifier onlyHospital() {
        require(hospitals[_msgSender()].addr == _msgSender(), "Only hospital can call this function");
        _;
    }

    modifier onlyMedic(address _hospital) {
        require(medicsInHospitals[_hospital][_msgSender()], "Only medic can call this function");
        _;
    }

    constructor (address _medicsBookAddress) {/* does nothing because is an upgradeable contract */}

    function initializeMedicineSupply (address medicsBookAddr) public initializer{
        __Ownable_init();
        medicsBook = IMedicsBook(medicsBookAddr);
        prescriptionsCount = 0;
    }

    function setMedicsBookAddr(address medicsBookAddr) public {
        medicsBook = IMedicsBook(medicsBookAddr);
    }

    function addHospital(address hospitalAddr, string memory _name, string memory _url) public onlyOwner {
        hospitals[hospitalAddr] = Hospital(hospitalAddr, _name, _url);
        hospitalsList.push(hospitalAddr);
    }

    function removeHospital(address hospitalAddr, string memory reason) public onlyOwner {
        require(hospitals[hospitalAddr].addr == hospitalAddr, "Hospital does not exist");
        delete hospitals[hospitalAddr];
        for(uint i = 0; i < hospitalsList.length; i++) {
            if(hospitalsList[i] == hospitalAddr) {
                hospitalsList[i] = hospitalsList[hospitalsList.length - 1];
                delete hospitalsList[hospitalsList.length - 1];
                hospitalsList.pop();
                break;
            }
        }
        emit HopitalRemoved(hospitalAddr, reason);
    }

    function getHospitalCount() public view returns (uint) {
        return hospitalsList.length;
    }

    function getHospital(address hospitalAddr) public view returns (Hospital memory) {
        return hospitals[hospitalAddr];
    }

    function addMedic(address medicAddr) public onlyHospital {
        require(hospitals[_msgSender()].addr == _msgSender(), "Hospital does not exist");
        Medic memory medic = medicsBook.getMedic(medicAddr);
        require(medic.addr == medicAddr, "Medic does not exist");
        medicsInHospitals[_msgSender()][medicAddr] = true;
        emit MedicAdded(_msgSender(), medicAddr, medic.name, medic.url);
    }

    function removeMedic(address medicAddr) public onlyHospital {
        require(hospitals[_msgSender()].addr == _msgSender(), "Hospital does not exist");
        require(medicsInHospitals[_msgSender()][medicAddr], "Medic does not exist");
        medicsInHospitals[_msgSender()][medicAddr] = false;
        emit MedicRemoved(_msgSender(), medicAddr);
    }

    
    function registerMedicine(bytes32 sku, string memory name, uint16 price) public onlyHospital{
        require(hospitals[_msgSender()].addr == _msgSender(), "Hospital does not exists");
        require(medicines[_msgSender()][sku].sku != sku, "Medicine was already registered");
        medicines[_msgSender()][sku] = Medicine(sku, name, price, 0);
        emit NewMedicine(_msgSender(), sku, name, price);
    }

    function addMedicines(bytes32[] memory skus, uint16[] memory quantities) public onlyHospital{
        require(hospitals[_msgSender()].addr == _msgSender(), "Hospital does not exists");
        require(skus.length > 0, "Nothing to add");
        require(skus.length == quantities.length, "skus lenght does not match with qty");
        for(uint i = 0; i < skus.length; i++){
            _addMedicine(_msgSender(), skus[i], quantities[i]);
        }

    }

    function _addMedicine(address hospitalAddr, bytes32 sku, uint16 quantity) internal {
        require(medicines[hospitalAddr][sku].sku == sku, "sku not registered yet");
        medicines[hospitalAddr][sku].quantity += quantity;
        emit BoughtMedicine(hospitalAddr, sku, quantity);
    }

    function _subsMedicine(address hospitalAddr, bytes32 sku, uint16 quantity) internal {
        require(medicines[hospitalAddr][sku].sku == sku, "sku not registered yet");
        medicines[hospitalAddr][sku].quantity -= quantity;
        emit SoldMedicine(hospitalAddr, sku, quantity);
    }

    function createPrescription(address hospitalAddr, address patientAddr, bytes32[] memory skus, uint16[] memory quantities) public onlyMedic(hospitalAddr) {
        require(hospitals[hospitalAddr].addr == hospitalAddr, "Hospital does not exist");
        require(skus.length > 0, "Nothing to add");
        require(skus.length == quantities.length, "skus lenght does not match with qty");
        ItemPrescription[] memory items = new ItemPrescription[](skus.length);
        for(uint i = 0; i < skus.length; i++){
            bytes32 sku = skus[i];
            uint16 qty = quantities[i];
            require(medicines[hospitalAddr][sku].sku == sku, "sku not registered yet");
            // require(medicines[hospitalAddr][sku].quantity >= qty, "Not enough medicine");
            items[i] = ItemPrescription(sku, qty);
        }
        uint prescriptionId = ++prescriptionsCount;
        prescriptions[prescriptionId].medic = _msgSender();
        prescriptions[prescriptionId].hospital = hospitalAddr;
        prescriptions[prescriptionId].patient = patientAddr;
        prescriptions[prescriptionId].filledStatus = 0x01;
        prescriptions[prescriptionId].timestamp = block.timestamp;
        // prescriptions[prescriptionId].items = new ItemPrescription[](items.length);
        patientPrescriptions[hospitalAddr][_msgSender()][patientAddr].push(prescriptionId);
        for(uint i = 0; i < items.length; i++){
            ItemPrescription memory item = items[i];
            console.log("index itemPrescription", i, "prescriptionId", prescriptionId);
            // prescriptions[prescriptionId].items[i].sku = item.sku;
            // prescriptions[prescriptionId].items[i].quantity = item.quantity;
            prescriptions[prescriptionId].items.push(item);
            if(medicines[hospitalAddr][item.sku].quantity == 0) {
                emit EmptyMedicine(hospitalAddr, item.sku, medicines[hospitalAddr][item.sku].name);
            }
        }
        emit NewPrescription(hospitalAddr, _msgSender(), patientAddr, prescriptionId);
    }

    function requestMedicines(uint prescriptionId) public {
        Prescription storage p = prescriptions[prescriptionId];
        require(p.patient == _msgSender(), "Only target patient can request medicines");
        require(p.filledStatus == 0x01, "Prescription already requested");
        ItemPrescription[] storage items = p.items;
        for(uint i = 0; i < items.length; i++){
            ItemPrescription storage item = items[i];
            // console.log("item.quantity", item.quantity, medicines[p.hospital][item.sku].quantity);
            if(item.quantity == 0) {
                emit EmptyMedicine(p.hospital, item.sku, medicines[p.hospital][item.sku].name);
            }
            require(item.quantity <= medicines[p.hospital][item.sku].quantity, "Not enough medicine at this moment");
        }
        //30 days after
        uint expiresOn = p.timestamp + 60 * 60 * 24 * 30;
        if(expiresOn > block.timestamp) {
            p.filledStatus = 0x02;
        }else{
            p.filledStatus = 0x05;
            emit ExpiredPrescription(p.hospital, prescriptionId);
        }
    }

    function fillPrescription(uint prescriptionId) public onlyHospital {
        address hospitalAddr = prescriptions[prescriptionId].hospital;
        require(hospitalAddr == _msgSender(), "Only target hospital can fill prescription");
        require(prescriptions[prescriptionId].filledStatus == 0x02, "Prescription is not in requested status");
        ItemPrescription[] storage items = prescriptions[prescriptionId].items;
        for(uint i = 0; i < items.length; i++){
            ItemPrescription storage item = items[i];
            if(item.quantity == 0) {
                emit EmptyMedicine(hospitalAddr, item.sku, medicines[hospitalAddr][item.sku].name);
            }
            require(item.quantity <= medicines[hospitalAddr][item.sku].quantity, "Not enough medicine at this moment");
            // medicines[hospitalAddr][item.sku].quantity -= item.quantity;
            // emit SoldMedicine(hospitalAddr, item.sku, item.quantity);
            _subsMedicine(hospitalAddr, item.sku, item.quantity);
        }
        prescriptions[prescriptionId].filledStatus = 0x03;
        emit PrescriptionFilled(hospitalAddr, prescriptionId);
    }

    function getItemsOfPrescription(uint prescriptionId) public view returns (ItemPrescription[] memory items){
        items = prescriptions[prescriptionId].items;
    }

}