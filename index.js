const express = require('express');
const bodyParser = require('body-parser');
const Multer = require('multer');
const cors = require('cors')
const Web3 = require('web3');
// const image = require('./public/images')
const {
    addProduct,
    buyProduct,
    getProduct,
    getAccounts,
    unlockAccount,
    getAllProducts,
    checkRemainToken,
    balance,
    freeProduct
 } = require('./blockchain');
 
const app = express();
const appPort = 3001;
app.use(cors())
app.use(express.json())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// let token;
// createContractInstance('Token').then(instance => {
//   token = instance;
// });


// const checkRemainToken = async (address) => {
//   const balance = await token.balanceOf.call(address)
//   return { balance };
// };

// const transferToken = async (address1, address2, value) => {
//   const receipt = await token.transfer.send(address1, address2, value, { from: address1, gas: 1000000 })
//   return receipt;
// };

// IMAGE UPLOADER SESSING
const upload = Multer({ dest: 'public/images/', limits: { files: 1 } });
const MAX_IMAGE_SIZE_BYTES = 10485760;

// app.get('/', (request, response, next) => {
//    response.send('Hello! Welcome to Simple E-commerce Application!');
// });

app.listen(appPort, () => console.log(`Ecommerce server is running! it is listening on port ${appPort}...`));


// ADD PRODUCT
app.post('/products/add', upload.single('productImageInput'), async (request, response) => {
    try {
      const { productNameInput, productPriceInput, productQtyInput, productSeller, accountPassword, productImageInput } = request.body;
      // const { file } = request;
      const file = {
        mimetype: 'image/png',
        filename: '123123.png',
        path: './image/12.png'
      }
      if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.mimetype)) {
        fs.unlinkSync(file.path);
        return response.json({
          success: false,
          error: 'Please upload a file as jpeg, png, or gif.',
        });
      }
  
      if (file.size > MAX_IMAGE_SIZE_BYTES) {
        fs.unlinkSync(file.path);
        return response.json({
          success: false,
          error: 'Please upload smaller file. (10MB)',
        });
      }
  
      if (!productNameInput || !productPriceInput || !productQtyInput || !productSeller) {
        return response.json({
          success: false,
          error: 'Please fill the form.',
        });
      }
  
      if (!Number.isInteger(Number(productPriceInput))) {
        return response.json({
          success: false,
          error: 'Plese enter product price in number',
        });
      }
  
      if (!Number.isInteger(Number(productQtyInput))) {
        return response.json({
          success: false,
          error: 'Plese enter product quantity in number',
        });
      }
      const productImagePath = productImageInput
      const unlocked = await unlockAccount(productSeller, '', 600);
      if (!unlocked) {
        return response.json({
          success: false,
          error: 'Please type correct account password.',
        });
      }
      const dataResult = await addProduct(productNameInput, productPriceInput, productQtyInput, productImagePath, productSeller);
      return response.json({
        success: true,
        data: { pid: dataResult.pid, transactionReceipt: dataResult.receipt }, 
        error: null,
      });
    } catch (error) {
      return response.json({
        success: false,
        error: error.message,
      });
    }
  });


  // BUY PRODUCT
app.post('/products/buy', async (request, response) => {
    try {
      const { pid, buyer, password, to } = request.body;
      if (!pid) {
        return response.json({
          success: false,
          error: 'Please select product ID.',
        });
      }
  
      if (!buyer) {
        return response.json({
          success: false,
          error: 'Please select address to be buyer.',
        });
      }
  
      const unlocked = await unlockAccount(buyer, password);
      if (!unlocked) {
        return response.json({
          success: false,
          error: 'Please type correct account password.',
        });
      }
      console.log('=======')
      await buyProduct(pid, buyer, to);
      return response.json({
        success: true,
        error: null,
      });
    } catch (error) {
      return response.json({
        success: false,
        error: error.message,
      });
    }
  });

  app.post('/products/free', async (request, response) => {
    try {
      const {  to } = request.body;

      console.log('=======')
      await freeProduct( to);
      return response.json({
        success: true,
        error: null,
      });
    } catch (error) {
      return response.json({
        success: false,
        error: error.message,
      });
    }
  });

  app.get('/balance/:wallet', async (request, response) => {
    try {
      
      let bla = await balance(request.params.wallet);
      return response.json(bla)
    }
    catch (error) {
      return response.json({
        success: false,
        error: error.message,
      });
    }
  });
  
  // GET PRODUCT
  app.get('/products/:pid', async (request, response) => {
    try {
       const { pid } = request.params;
        const result = await getProduct(pid);
        return response.json({
           success: true,
           data: result,
           error: null,
        });
    }
    catch (error) {
      return response.json({
        success: false,
        error: error.message,
      });
    }
  });

  app.get('/', async (request, response) => {
    try {
      coin = await checkRemainToken('0x197b6caFAf8507eF27926027b292343b7D8f76b8')
      coin1 = await checkRemainToken('0xFa9e1d7225abf4c255E149301c8CafC8EFA80891')
      console.log(coin.balance)
      console.log(coin1.balance)
      console.log(Web3.utils.BN(coin.balance).toString())
      console.log(Web3.utils.BN(coin1.balance).toString())
      
      const result = await getAllProducts();
      return response.json({
        success: true,
        data: result,
      });
    } catch (error) {
      return response.json({
        success: false,
        error: error.message,
      });
    }
  });

  app.get('/accounts', async (request, response) => {
    try {
      const result = await getAccounts();
      return response.json({
        success: true,
        data: result,
      });
    } catch (error) {
      return response.json({
        success: false,
        error: error.message,
      });
    }
  });

  app.get('/getAllProducts', async (request, response, next) => {
    const accounts = await getAccounts();
    const products = await Promise.all((await getAllProducts()).map(pid => getProduct(pid)));

    for( product of products) {
      product.price = Web3.utils.BN(product.price).toString()
      product.quantity = Web3.utils.BN(product.quantity).toString()
    }

    return response.json({ products });
  });
  

app.get('/xx',async (request, response) => {
  console.log(123)
  const accounts = await getProduct(1583475447358);
  return response.json({ accounts });
  });
  
//   app.post('/products/buy', (request, response) => {
//     response.send('Buy a product');
//   });