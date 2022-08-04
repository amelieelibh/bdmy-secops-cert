// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;


import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
// import "hardhat/console.sol";

struct Medic{
    address addr;
    string name;
    string url;
}


contract MedicsBook is Initializable, ERC721Upgradeable, PausableUpgradeable {
    mapping(address => Medic) medics;
    address[] public medicsList;

    event NewMedic(address addr, string name);

    modifier onlyMedic() {
        require(existMedic(msg.sender), "Only medic can call this function");
        _;
    }

    constructor(){}
    
    function initialize() public initializer{
    }
    
    function addMedic(string memory _name, string memory _url) public {
        medics[msg.sender] = Medic(msg.sender, _name, _url);
        medicsList.push(msg.sender);
    }

    function getMedic(address _medic) public view returns (Medic memory) {
        return medics[_medic];
    }

    function updateMedic(string memory _name, string memory _url) public onlyMedic {
        medics[msg.sender].name = _name;
        medics[msg.sender].url = _url;
    }

    function existMedic(address _medic) public view returns (bool) {
        return medics[_medic].addr == _medic;
    }
    
    function getDoctorsCount() public view returns (uint256) {
        return medicsList.length;
    }
    
    function getDoctors(uint page, uint size) public view returns (address[] memory) {
        require(page > 0, "Page must be greater than 0");
        require(size > 0, "Size must be greater than 0");
        uint totalMedics = getDoctorsCount();
        uint firstIndex = (page - 1) * size;
        require(firstIndex < totalMedics, "Page out of range");
        uint nextLast = page * size;
        uint lastIndex = nextLast < totalMedics ? nextLast : totalMedics;
        require(firstIndex < lastIndex, "Page out of range");
        uint maxSize = lastIndex - firstIndex;
        address[] memory result = new address[](maxSize);
        // console.log("indexes", firstIndex, lastIndex, totalMedics);
        if(lastIndex == firstIndex) {
            return result;
        }
        uint j = 0;
        for (uint i = firstIndex; i < lastIndex; i++) {
            // console.log("i", i, "j", j);
            result[j++] = medicsList[i];
        }
        return result;
    }
}