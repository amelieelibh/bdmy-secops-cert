// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;


import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";


struct Medic{
    address addr;
    string name;
    string url;
}

struct Medicine{
    bytes32 sku;
    string name;
    uint8 price;
    uint8 quantity;
}

struct Hospital{
    address addr;
    string name;
    string url;
}

interface MedicsBook{
    function getMedic(address _medic) external view returns (Medic memory);
    function existMedic(address _medic) external view returns (bool);
}

contract MedicineSupply is Initializable, ERC721Upgradeable, PausableUpgradeable, OwnableUpgradeable{

    address owner;

    mapping(address => Hospital) hospitals;
    address[] hospitalsList;

    mapping(address => mapping(address => bool)) public medicsInHospitals;

    /** Medicines in Hospital - address of Hospital mapped to medicines by name */
    mapping(address => mapping(bytes32 => Medicine)) public medicines;

    MedicsBook _medicsBook;


    event NewHospital(address indexed hospitalAddr, string name, string url);
    event HopitalRemoved(address indexed hospitalAddr, string reason);

    event MedicAdded(address indexed hospitalAddr, address indexed medicAddr, string name, string url);
    event MedicRemoved(address indexed hospitalAddr, address indexed medicAddr);

    event NewMedicine(address indexed hospitalAddr, bytes32 indexed sku, string name, uint8 price);
    event BoughtMedicine(address indexed hospitalAddr, bytes32 indexed sku, uint8 quantity);
    event SoldMedicine(address indexed hospitalAddr, bytes32 indexed sku, uint8 quantity);
    event EmptyMedicine(address indexed hospitalAddr, bytes32 indexed sku, string name);

    modifier onlyHospital() {
        require(hospitals[msg.sender].addr == msg.sender, "Only hospital can call this function");
        _;
    }

    modifier onlyMedic(address _hospital) {
        require(medicsInHospitals[_hospital][msg.sender], "Only medic can call this function");
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    constructor (address medicsBookAddr) {
        _medicsBook = MedicsBook(medicsBookAddr);
    }

    function setMedicsBookAddr(address medicsBookAddr) public {
        _medicsBook = MedicsBook(medicsBookAddr);
    }

    function addHospital(address hospitalAddr, string memory _name, string memory _url) public {
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

    function addMedic(address medicAddr) public onlyHospital {
        require(hospitals[msg.sender].addr == msg.sender, "Hospital does not exist");
        Medic memory medic = _medicsBook.getMedic(medicAddr);
        require(medic.addr == medicAddr, "Medic does not exist");
        medicsInHospitals[msg.sender][medicAddr] = true;
        emit MedicAdded(msg.sender, medicAddr, medic.name, medic.url);
    }

    function removeMedic(address medicAddr) public onlyHospital {
        require(hospitals[msg.sender].addr == msg.sender, "Hospital does not exist");
        require(medicsInHospitals[msg.sender][medicAddr], "Medic does not exist");
        medicsInHospitals[msg.sender][medicAddr] = false;
        emit MedicRemoved(msg.sender, medicAddr);
    }

    
    function registerMedicine(bytes32 sku, string memory name, uint8 price) public onlyHospital{
        require(hospitals[msg.sender].addr == msg.sender, "Hospital does not exists");
        require(medicines[msg.sender][sku].sku != sku, "Medicine was already registered");
        medicines[msg.sender][sku] = Medicine(sku, name, price, 0);
        emit NewMedicine(msg.sender, sku, name, price);
    }

    function addMedicines(bytes32[] memory skus, uint8[] memory quantities) public onlyHospital{
        require(hospitals[msg.sender].addr == msg.sender, "Hospital does not exists");
        require(skus.length > 0, "Nothing to add");
        require(skus.length == quantities.length, "skus lenght does not match with qty");
        for(uint i = 0; i < skus.length; i++){
            _addMedicine(msg.sender, skus[i], quantities[i]);
        }

    }

    function _addMedicine(address hospitalAddr, bytes32 sku, uint8 quantity) internal {
        require(medicines[hospitalAddr][sku].sku == sku, "sku not registered yet");
        medicines[hospitalAddr][sku].quantity += quantity;
        emit BoughtMedicine(hospitalAddr, sku, quantity);
    }

    function _subsMedicine(address hospitalAddr, bytes32 sku, uint8 quantity) internal {
        require(medicines[hospitalAddr][sku].sku == sku, "sku not registered yet");
        medicines[hospitalAddr][sku].quantity -= quantity;
        emit SoldMedicine(hospitalAddr, sku, quantity);
    }
}