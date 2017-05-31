var Splitter = artifacts.require("./Splitter.sol");

contract('Splitter', function(accounts) {
  let splitter;

  beforeEach("deploy and prepare", function() {
    return Splitter.new(accounts[1], accounts[2])
        .then(function(instance) {
          splitter = instance;
        });
  });

  it("should create the contract with 2 receivers", async function() {
    const instance = await Splitter.deployed();
    const receiver1 = await instance.receiver1.call();
    assert.equal(receiver1, accounts[1], '');
    const receiver2 = await instance.receiver2.call();
    assert.equal(receiver2, accounts[2], '');
  });

  it("should send split eth between the 2 receivers", async function() {

    var amount = 40000;

    // Get initial balances of the accounts
    const funder =  await splitter.funder.call();
    const receiver1 = await splitter.receiver1.call();
    const receiver2 = await splitter.receiver2.call();

    const receiver1_starting_balance = await web3.eth.getBalance(receiver1);
    const receiver2_starting_balance = await web3.eth.getBalance(receiver2);

    await splitter.splitFunds.sendTransaction({from: funder, value: amount});

    const receiver1_ending_balance = await web3.eth.getBalance(receiver1);
    const receiver2_ending_balance = await web3.eth.getBalance(receiver2);

    assert.deepEqual(receiver1_ending_balance, receiver1_starting_balance.plus(amount/2), "Amount wasn't correctly split to receiver1");
    assert.deepEqual(receiver2_ending_balance, receiver2_starting_balance.plus(amount/2), "Amount wasn't correctly split to receiver1");
  });
});
