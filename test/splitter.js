var Splitter = artifacts.require("./Splitter.sol");

contract('Splitter', function(accounts) {
  it("should create the contract with 2 receivers", async function() {
    const instance = await Splitter.deployed();
    const receiver1 = await instance.receiver1.call();
    assert.equal(receiver1, accounts[1], '');
    const receiver2 = await instance.receiver2.call();
    assert.equal(receiver2, accounts[2], '');
  });

  it("should send split eth between the 2 receivers", async function() {
    const splitter = await Splitter.deployed();

    var amount = 40000;

    // Get initial balances of the accounts
    const funder =  await splitter.funder.call();
    const receiver1 = await splitter.receiver1.call();
    const receiver2 = await splitter.receiver2.call();

    const funder_starting_balance = await web3.eth.getBalance(funder).toNumber();
    const receiver1_starting_balance = await web3.eth.getBalance(receiver1).toNumber();
    const receiver2_starting_balance = await web3.eth.getBalance(receiver2).toNumber();
    console.log(`funder_starting_balance = ${funder_starting_balance}`);
    console.log(`receiver1_starting_balance = ${receiver1_starting_balance}`);
    console.log(`receiver2_starting_balance = ${receiver2_starting_balance}`);

    const ret = await splitter.splitFunds.sendTransaction({from: funder, value: amount});
    console.log(`Split funds, ret = ${ret}`);

    const funder_ending_balance = await web3.eth.getBalance(funder).toNumber();
    const receiver1_ending_balance = await web3.eth.getBalance(receiver1).toNumber();
    const receiver2_ending_balance = await web3.eth.getBalance(receiver2).toNumber();
    console.log(`funder_ending_balance = ${funder_ending_balance}`);
    console.log(`funder_ending_balance = ${funder_ending_balance}`);
    console.log(`receiver1_ending_balance = ${receiver1_ending_balance}`);
    console.log(`receiver2_ending_balance = ${receiver2_ending_balance}`);

    assert.equal(receiver1_ending_balance, receiver1_starting_balance + amount / 2, "Amount wasn't correctly split to receiver1");
    assert.equal(receiver2_ending_balance, receiver2_starting_balance + amount / 2, "Amount wasn't correctly split to receiver1");
  });
});
