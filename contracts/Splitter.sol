pragma solidity ^0.4.8;

contract Splitter {

  address public funder;
  address public receiver1;
  address public receiver2;

  function Splitter(address rec1, address rec2) {
    funder = msg.sender;

    // TODO validate rec accounts
    receiver1 = rec1;
    receiver2 = rec2;
  }

  function splitFunds() payable {
    // This doesn't work?
    //require(msg.sender == funder);

    if (msg.sender != funder) {
      return;
    }

    uint splitAmount = msg.value / 2;

    receiver1.send(splitAmount);
    receiver2.send(splitAmount);
  }

  function destroy() {
    if (msg.sender == funder) {
      selfdestruct(funder);
    }
  }
}