const fs = require('fs');
const path = require('path');
const Web3 = require('web3');
const TruffleContract = require('@truffle/contract');

const web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
const web3 = new Web3(web3Provider);

const createContractInstance = async artifactName => {
 const artifact = JSON.parse(fs.readFileSync(path.join(__dirname, 'build/contracts', `${artifactName}.json`)));
  const contract = TruffleContract(artifact);
  contract.setProvider(web3Provider);
  return contract.deployed();
};

let shop;
createContractInstance('Shop').then(instance => {
  shop = instance;
  // console.log(shop);
});

let token;
createContractInstance('Token').then(instance => {
  token = instance;
});

const checkRemainToken = async (address) => {
  const balance = await token.balanceOf.call(address)
  return { balance };
};

const transferToken = async (address1, address2, value) => {
  const receipt = await token.transfer.send(address1, address2, value, { from: address1, gas: 1000000 })
  return receipt;
};


const addProduct = async (name, price, quantity, imgPath, seller) => {
    const timestamp = Date.now();
    const pid = timestamp;
    const receipt = await shop.addProduct(pid, name, price, quantity, imgPath, timestamp, { from: seller, gas: 1000000 });
    return { receipt: receipt, pid: pid };
  };

  const buyProduct = async (pid, buyer, to) => {
    try {
      console.log(to,'aaaaa')
      var balance = await web3.eth.getBalance('0x197b6caFAf8507eF27926027b292343b7D8f76b8')
      console.log(balance);
      
      const product = await getProduct(pid);
      const eth = Web3.utils.toWei(product.price, "ether");
      await web3.eth.sendTransaction({from: buyer, to: to, value: eth});
      const receipt = await shop.buyProduct(pid, Date.now(), { from: buyer, gas: 1000000 });
      return {receipt:'ok'};
    } catch (error) {
      if (error.reason) throw new Error(error.reason);
      throw error;
    }
  };

  const freeProduct = async ( to) => {
    try {
      console.log(to,'aaaaa')
      // var balance = await web3.eth.getBalance('0x197b6caFAf8507eF27926027b292343b7D8f76b8')
      // console.log(balance);
      
      // const product = await getProduct(pid);
      const eth = Web3.utils.toWei('0.5', "ether");
      await web3.eth.sendTransaction({from: '0x2Af9F1d3f678f4Ab7Ec14fb4862807556C3F1372', to: to, value: eth});
      // const receipt = await shop.buyProduct(pid, Date.now(), { from: buyer, gas: 1000000 });
      return {receipt:'ok'};
    } catch (error) {
      if (error.reason) throw new Error(error.reason);
      throw error;
    }
  };

  const balance = async (acc) => {
    try {
      var balance = await web3.eth.getBalance(acc)
      const eth = Web3.utils.fromWei(balance, "ether");
      console.log(eth);
      
      // const product = await getProduct(pid);
      // const eth = Web3.utils.fromWei(product.price, "ether");
      // await web3.eth.sendTransaction({from: buyer, to: to, value: eth});
      // const receipt = await shop.buyProduct(pid, Date.now(), { from: buyer, gas: 1000000 });
      return {balance:eth};
    } catch (error) {
      if (error.reason) throw new Error(error.reason);
      throw error;
    }
  };

//   require(products[_pid].quantity > 0, "Product is sold out");

  const getProduct = async (pid) => {
    const product = await shop.getProduct.call(pid);
    product.id = pid;
    // console.log(Web3.utils.BN(product.price).toString())
    // console.log('===================1',Web3.utils.fromWei(product.price.toNumber(),"ether"))
    return product;
  };

  const getAccounts = () => web3.eth.getAccounts();

const unlockAccount = (address, password) => web3.eth.personal.unlockAccount(address, password, 600);
// web3.eth.personal.unlockAccount("0x11f4d0A3c12e86B4b5F39B213F7E19D048276DAe", "test password!", 600)
// .then(console.log('Account unlocked!'));

const getAllProducts = async () => {
  const events = await shop.getPastEvents('AddedProduct', { fromBlock: 0 });
  const allPids = events.map(item => item.returnValues.pid);
  return allPids;
};

module.exports = {
  addProduct,
  getProduct,
  buyProduct,
  getAccounts,
  unlockAccount,
  getAllProducts,
  checkRemainToken,
  balance,
  freeProduct
};

