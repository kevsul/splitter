const Web3 = require("web3");
const Promise = require("bluebird");
const truffleContract = require("truffle-contract");
const $ = require("jquery");
// Not to forget our built contract
const splitterJson = require("../../build/contracts/Splitter.json");

// Supports Mist, and other wallets that provide 'web3'.
if (typeof web3 !== 'undefined') {
    // Use the Mist/wallet/Metamask provider.
    window.web3 = new Web3(web3.currentProvider);
} else {
    // Your preferred fallback.
    window.web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
}
Promise.promisifyAll(web3.eth, { suffix: "Promise" });

const Splitter = truffleContract(splitterJson);
Splitter.setProvider(web3.currentProvider);

window.addEventListener('load', function() {
    $("#split").click(splitFunds);
    return web3.eth.getAccountsPromise()
        .then(accounts => {
            if (accounts.length == 0) {
                $("#balance").html("N/A");
                throw new Error("No account with which to transact");
            }
            window.funderAccount = accounts[0];
            window.receiver1Account = accounts[1];
            window.receiver2Account = accounts[2];

            return Splitter.deployed()
                .then(instance => window.contractAccount = instance.contract.address)
                .then(() => {
                    return showBalances();
                });
        })
        .catch(console.error);
});

function showBalance(address, elemId) {
    return web3.eth.getBalancePromise(address).then(balance => {
        $(elemId).html(web3.fromWei(balance.toString(10), 'ether'));
    });
}

function showBalances() {
    return Promise.all([
        showBalance(window.funderAccount, '#funder_balance'),
        showBalance(window.receiver1Account, '#receiver1_balance'),
        showBalance(window.receiver2Account, '#receiver2_balance'),
        showBalance(window.contractAccount, '#contract_balance')
    ]);
}

require("file-loader?name=../index.html!../index.html");

const splitFunds = function() {
    let deployed;
    return Splitter.deployed()
        .then(_deployed => {
            deployed = _deployed;
            var toSplit = $("input[name='amount']").val();
            toSplit = web3.toWei(toSplit, 'ether');
            return _deployed.splitFunds.sendTransaction({
                from: window.funderAccount,
                value: toSplit
            });
        })
        .then(txHash => {
            $("#status").html("Transaction on the way " + txHash);
            // Now we wait for the tx to be mined.
            const tryAgain = () => web3.eth.getTransactionReceiptPromise(txHash)
                .then(receipt => receipt !== null ?
                    receipt :
                    // Let's hope we don't hit the max call stack depth
                    Promise.delay(500).then(tryAgain));
            return tryAgain();
        })
        .then(receipt => {
            if (receipt.logs.length == 0) {
                console.error("Empty logs");
                console.error(receipt);
                $("#status").html("There was an error in the tx execution");
            } else {
                // Format the event nicely.
                console.log(deployed.Transfer().formatter(receipt.logs[0]).args);
                $("#status").html("Transfer executed");
            }
            // Make sure we update the UI.
            showBalances();
        })
        .catch(e => {
            $("#status").html(e.toString());
            console.error(e);
        });
};
