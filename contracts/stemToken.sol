//SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.14;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract stemToken is ERC20,Ownable{
    uint256 startTime;
    uint256 totalBurnt;
    uint256 maxBurn;
    uint256 quarter = 90 days;
    mapping(uint => uint256)public quarterAmount; 
    constructor(uint256 amount)ERC20("STEM_Token","STEM"){
        _mint(owner(),112000000*10**decimals());
        startTime = block.timestamp;
        maxBurn = amount*10**decimals();
    }

    function burn(address account,uint256 _amount) external virtual onlyOwner{
        
        uint quarterNumber = (block.timestamp-startTime)/quarter;
        require(quarterAmount[quarterNumber]+_amount <= (maxBurn*18)/100,"Limit excedeed");
        require(totalBurnt+_amount<= maxBurn,"Invalid burn amount");
        _burn(account,_amount);
        quarterAmount[quarterNumber]+= _amount;
        totalBurnt+= _amount;
        
    }

    function decimals() public view virtual override returns(uint8){
        return 8;
    }
    
}