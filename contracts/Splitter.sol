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
    if (msg.sender != funder) {
      return;
    }

    uint splitAmount = msg.value / 2;
    uint toReturn = msg.value - (splitAmount * 2);

    if (!receiver1.send(splitAmount)) {
      toReturn += splitAmount;
    }
    if (!receiver2.send(splitAmount)) {
      toReturn += splitAmount;
    }

    // If msg.value is odd (and the 2 sends succeed), there will be only 1 wei left over.
    // Is it worth sending back? It will cost more than that...
    if (toReturn > 0) {
      funder.send(toReturn);
    }
  }

  function destroy() {
    if (msg.sender == funder) {
      selfdestruct(funder);
    }
  }
}