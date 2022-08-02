// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

struct Medic{
    address addr;
    string name;
    string url;
}


contract MedicsBook {
    mapping(address => Medic) medics;
    address[] public medicsList;

    event NewMedic(address addr, string name);

    modifier onlyMedic() {
        require(existMedic(msg.sender), "Only medic can call this function");
        _;
    }

    constructor() {
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
        uint totalMedics = getDoctorsCount();
        address[] memory result = new address[](size < totalMedics ? size : totalMedics);
        if(page * size > totalMedics) {
            return result;
        }
        uint nextPage = page + 1;
        uint nextLast = nextPage * size;
        for (uint i = page * size; i < (nextLast < totalMedics ? nextLast : totalMedics); i++) {
            result[i] = medicsList[page * size + i];
        }
        return result;
    }
}