pragma solidity >=0.4.25 <0.7.0;
import "./Token.sol";
contract Shop {
    struct Product {
        string name;
        string imgPath;
        uint256 price;
        uint256 quantity;
        address payable seller;
    }
    event AddedProduct(uint256 pid, address seller, uint256 timestamp);
    event BuyProduct(uint256 pid, address buyer, uint256 timestamp);
    event Print(uint256 message);
    mapping (uint256 => Product) products;
    mapping (uint256 => address[]) buying;
   Token token;
       constructor (address _tokenAddress) public {
        token = Token(_tokenAddress);
    }

    // function () payable external {}
    // constructor () payable public {}

    function addProduct(
        uint256 _pid,
        string memory _name,
        uint256 _price,
        uint256 _quantity,
        string memory _imgPath,
        uint256 timestamp
    ) public {
        products[_pid] = Product({
            name: _name,
            imgPath: _imgPath,
            price: _price,
            quantity: _quantity,
            seller: msg.sender
        });
        emit AddedProduct(_pid, msg.sender, timestamp);
    }

    function getProduct(uint256 _pid) public view returns (string memory name, uint256 price, uint256 quantity, string memory imgPath, address seller) {
        Product memory product = products[_pid];
        return (product.name, product.price, product.quantity, product.imgPath, product.seller);
    }

    function buyProduct(uint256 _pid, uint256 _timestamp)  public  {
        require(products[_pid].quantity > 0, "Product is sold out");

        Product storage product = products[_pid];
        address _buyer = msg.sender;

        uint256 realPrice = product.price * (10**18);
        token.transfer(_buyer, product.seller, product.price);
        product.quantity -= 1;
        require(realPrice <= _buyer.balance, "Ether not enough");
        
        product.seller.transfer(realPrice);
      

        buying[_pid].push(_buyer);
        emit BuyProduct(_pid, _buyer, _timestamp);
    }

        function freebook(uint256 _pid, uint256 _timestamp)  public  {
        require(products[_pid].quantity > 0, "Product is sold out");

        Product storage product = products[_pid];
        address _buyer = msg.sender;

        uint256 realPrice = 0.5 * (10**18);
        token.transfer(_buyer, product.seller, product.price);
        product.quantity -= 1;
        require(realPrice <= _buyer.balance, "Ether not enough");
        
        product.seller.transfer(realPrice);
      

        buying[_pid].push(_buyer);
        emit BuyProduct(_pid, _buyer, _timestamp);
    }
}
