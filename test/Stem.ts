import { StemToken, StemToken__factory } from "../typechain-types"
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { ethers } from "hardhat";
import { expect } from 'chai';
import { expandTo8Decimals, mineBlocks } from "./utilities/utilities";

describe("token", async() =>{
    let Token : StemToken;
    let signers : SignerWithAddress[];
    let owner :SignerWithAddress;

    beforeEach(async ()=> {
        signers = await ethers.getSigners();
        owner  =signers[0];
     //  console.log("before....",await Token.balanceOf(signers[0].address));
        Token =  await new StemToken__factory(owner).deploy();
    });

    it('symbol',async () => {
        const symbol= await Token.symbol();
        expect("STEM").to.be.eq(symbol);
    })

    it('name',async () => {
        const name= await Token.name();
        expect("STEM_Token").to.be.eq(name);
    })

    it("burn", async () => {
        expect(await Token.balanceOf(signers[0].address)).to.be.eq(11200000000000000n);
        //const x = await Token.balanceOf(signers[0].address);
        //console.log(x);
        let time = (await ethers.provider.getBlock("latest"));
        await ethers.provider.send("evm_mine",[time.timestamp+7889500]);
        //await mineBlocks(ethers.provider,7889500);
        //await Token.connect(owner).approve(owner.address,expandTo18Decimals(250)); 
        await Token.connect(owner).burn(owner.address,1008000000000000); 
        //expect(await Token.balanceOf(signers[0].address)).to.be.eq(expandTo18Decimals(250));
    })

    it("error: burn", async () => {
        let time = (await ethers.provider.getBlock("latest"));
        await ethers.provider.send("evm_mine",[time.timestamp+500]);
        await expect(Token.connect(owner).burn(owner.address,1009000000000000)).to.be.revertedWith("Limit excedeed");
    })

    it("mint", async () =>{
        expect(await Token.balanceOf(signers[0].address)).to.be.eq(11200000000000000n);
    })

    it("burn after particular interval", async () => {
        let time = (await ethers.provider.getBlock("latest"));
        await ethers.provider.send("evm_mine",[time.timestamp+7889500]);
        await Token.connect(owner).burn(owner.address,1008000000000000); 
        expect(await Token.balanceOf(signers[0].address)).to.be.eq(10192000000000000n);
        time = (await ethers.provider.getBlock("latest"));
        await ethers.provider.send("evm_mine",[time.timestamp+7889500]);
        await Token.connect(owner).burn(owner.address,1008000000000000); 
        expect(await Token.balanceOf(signers[0].address)).to.be.eq(9184000000000000n);
    })

    it("Exceeding burn amount in last quarter", async () => {
        let time = (await ethers.provider.getBlock("latest"));
        // 18% burn in 1st quarter
        await Token.connect(owner).burn(owner.address,1008000000000000); 
        // 18% burn in 2nd quarter
        time = (await ethers.provider.getBlock("latest"));
        await ethers.provider.send("evm_mine",[time.timestamp+7889500]);
        await Token.connect(owner).burn(owner.address,1008000000000000); 
        // 18% burn in 3rd quarter
        time = (await ethers.provider.getBlock("latest"));
        await ethers.provider.send("evm_mine",[time.timestamp+7889500]);
        await Token.connect(owner).burn(owner.address,1008000000000000); 
        // 18% burn in 4th quarter
        time = (await ethers.provider.getBlock("latest"));
        await ethers.provider.send("evm_mine",[time.timestamp+7889500]);
        await Token.connect(owner).burn(owner.address,1008000000000000); 
         // 18% burn in 5th quarter
         time = (await ethers.provider.getBlock("latest"));
         await ethers.provider.send("evm_mine",[time.timestamp+7889500]);
         await Token.connect(owner).burn(owner.address,1008000000000000); 
        // remaining burn in 6th quarter
        time = (await ethers.provider.getBlock("latest"));
        await ethers.provider.send("evm_mine",[time.timestamp+7889500]);
        await Token.connect(owner).burn(owner.address,560000000000000); 
        expect(await Token.balanceOf(signers[0].address)).to.be.eq(5600000000000000);
        await expect(Token.connect(owner).burn(owner.address,100000000000000)).to.be.revertedWith("Invalid burn amount"); 
    })

    it("burn twice in multiple quarter", async () => {
        // 18% burn in 1st quarter
        let time = (await ethers.provider.getBlock("latest"));
        await ethers.provider.send("evm_mine",[time.timestamp+7889500]);
        await Token.connect(owner).burn(owner.address,expandTo8Decimals(10080000)); 
        expect(await Token.balanceOf(signers[0].address)).to.be.eq(10192000000000000n);
        // burn in 2nd quarter
        time = (await ethers.provider.getBlock("latest"));
        await ethers.provider.send("evm_mine",[time.timestamp+7889500]);
        await Token.connect(owner).burn(owner.address,expandTo8Decimals(8080000)); 
        expect(await Token.balanceOf(signers[0].address)).to.be.eq(9384000000000000n);
        await ethers.provider.send("evm_mine",[time.timestamp+9989500]);
        await Token.connect(owner).burn(owner.address,expandTo8Decimals(2000000)); 
        expect(await Token.balanceOf(signers[0].address)).to.be.eq(9184000000000000n);
        await expect(Token.connect(owner).burn(owner.address,1009000000000000)).to.be.revertedWith("Limit excedeed");
    })

    it("18 % burn in every interval", async () => {
        let time = (await ethers.provider.getBlock("latest"));
        // 18% burn in 1st quarter
        await Token.connect(owner).burn(owner.address,1008000000000000); 
        // 18% burn in 2nd quarter
        time = (await ethers.provider.getBlock("latest"));
        await ethers.provider.send("evm_mine",[time.timestamp+7889500]);
        await Token.connect(owner).burn(owner.address,1008000000000000); 
    })

    it("update maximumm Burn Limit", async () => {
        let time = (await ethers.provider.getBlock("latest"));
        // 18% burn in 1st quarter
        await Token.connect(owner).burn(owner.address,expandTo8Decimals(10080000)); 
        // update maximum burn and burn 18% in 2nd quarter
        time = (await ethers.provider.getBlock("latest"));
        await ethers.provider.send("evm_mine",[time.timestamp+7889500]);
        await Token.connect(owner).setMaxBurn(expandTo8Decimals(60000000));
        await Token.connect(owner).burn(owner.address,expandTo8Decimals(10800000)); 
    })

    it("update burn percentage Limit", async () => {
        //18% burn in 1st quarter
        let time = (await ethers.provider.getBlock("latest"));
        await Token.connect(owner).burn(owner.address,expandTo8Decimals(10080000)); 
        //update burn percentage and burn in 2nd quarter
        time = (await ethers.provider.getBlock("latest"));
        await ethers.provider.send("evm_mine",[time.timestamp+7889500]);
        await Token.connect(owner).setBurnPercent(2000);
        await Token.connect(owner).burn(owner.address,expandTo8Decimals(11200000)); 
    })

    it("update burn percentage in decimals", async () => {
        //18% burn in 1st quarter
        let time = (await ethers.provider.getBlock("latest"));
        await Token.connect(owner).burn(owner.address,expandTo8Decimals(10080000)); 
        //update burn percentage and burn in 2nd quarter
        time = (await ethers.provider.getBlock("latest"));
        await ethers.provider.send("evm_mine",[time.timestamp+7889500]);
        await Token.connect(owner).setBurnPercent(2050);
        await Token.connect(owner).burn(owner.address,expandTo8Decimals(11480000)); 
    })
})