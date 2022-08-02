// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ERC20Sell is ERC20{
    
    constructor() ERC20("Blockdemy Community Token", "BCT") {
        _mint(msg.sender, 1000 * 1e18);
    }

}