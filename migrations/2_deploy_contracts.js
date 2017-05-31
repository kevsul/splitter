var Splitter = artifacts.require("./Splitter.sol");

module.exports = function(deployer, network, accounts) {
  console.log(`account1 = ${accounts[1]}, account2 = ${accounts[2]}`);
  deployer.deploy(Splitter, accounts[1], accounts[2]);
};
