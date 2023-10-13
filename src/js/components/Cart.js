import {select, settings,classNames, templates} from '../settings.js';
import {utils} from '../utils.js';
import CartProduct from './CartProduct.js';


class Cart{
    constructor(element){
      const thisCart = this;
      thisCart.products = [];

      thisCart.getElements(element);
      thisCart.initActions();
      console.log('new Cart', thisCart);
    }

    getElements(element){
      const thisCart = this;
      thisCart.dom = {};
      thisCart.dom.wrapper = element;
      thisCart.dom.toggleTrigger = element.querySelector(select.cart.toggleTrigger);
      thisCart.dom.productList = element.querySelector(select.cart.productList);
      thisCart.dom.deliveryFee = element.querySelector(select.cart.deliveryFee);
      thisCart.dom.subtotalPrice = element.querySelector(select.cart.subtotalPrice);
      thisCart.dom.totalPrice = element.querySelectorAll(select.cart.totalPrice);
      thisCart.dom.totalNumber = element.querySelector(select.cart.totalNumber);
      thisCart.dom.form = element.querySelector(select.cart.form);
      thisCart.dom.address = element.querySelector(select.cart.address);
      thisCart.dom.phone = element.querySelector(select.cart.phone);
      console.log('adres i telefon', thisCart.dom.adress, thisCart.dom.phone);
    }
    initActions() {
      const thisCart = this;
      thisCart.dom.toggleTrigger.addEventListener('click',function(){
        thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
      });
      thisCart.dom.productList.addEventListener('updated', function(){
        thisCart.update();
      });
      thisCart.dom.productList.addEventListener('remove', function(event){
        thisCart.remove(event.detail.cartProduct);
      });
      thisCart.dom.form.addEventListener('submit', function(event){
        event.preventDefault();
        thisCart.sendOrder();
      });
    }

    remove(productToRemove){
      const thisCart = this;
      productToRemove.dom.wrapper.remove();
      const indexOfProduct = thisCart.products.indexOf('productToRemove');
      console.log('index',indexOfProduct);
      console.log('tablica produktow', thisCart.products);
      thisCart.products.splice(indexOfProduct,1);
      console.log('tablica z usunietym', thisCart.products);
      thisCart.update();
    }

    add(menuProduct){
      const thisCart = this;

      /* generate HTML based on template*/
       const generatedHTML = templates.cartProduct(menuProduct);

      /* create element using utils.createElementFromHTML*/
      const generatedDOM = utils.createDOMFromHTML(generatedHTML);


      /* add element to menu */
      thisCart.dom.productList.appendChild(generatedDOM);
      //console.log('adding product', generatedDOM);

      thisCart.products.push(new CartProduct(menuProduct,generatedDOM));
     // console.log('thisCart.products',thisCart.products);
     thisCart.update();
    }

    update(){
      const thisCart =  this;
      console.log ('opcje koszyka',thisCart);
      thisCart.deliveryFee = settings.cart.defaultDeliveryFee;
      thisCart.totalNumber = 0;
      thisCart.subtotalPrice = 0;

      for (let product of thisCart.products){
        console.log('tablica z produktami', thisCart.products);
        thisCart.totalNumber += product.amount;
        console.log('liczba sztuk w koszyku',thisCart.totalNumber);
        thisCart.subtotalPrice += product.price;
        console.log('cena bez dostawy koszyka', thisCart.subtotalPrice);
      }
      if(thisCart.totalNumber!==0){
      thisCart.totalPrice = thisCart.subtotalPrice + thisCart.deliveryFee;
      console.log('cena z dostawa koszyka', thisCart.totalPrice);}
      else {
        thisCart.deliveryFee = 0;
        thisCart.totalPrice=0;
      }

      thisCart.dom.deliveryFee.innerHTML = thisCart.deliveryFee;
      thisCart.dom.subtotalPrice.innerHTML = thisCart.subtotalPrice;
      thisCart.dom.totalNumber.innerHTML = thisCart.totalNumber;
      for (let price of thisCart.dom.totalPrice){
        price.innerHTML = thisCart.totalPrice;
      }

    }
    sendOrder(){
     const  thisCart = this;
     const url = settings.db.url + '/' + settings.db.orders;

    const payload = {
      adress: thisCart.dom.address.value,
      phone:thisCart.dom.phone.value,
      totalPrice: thisCart.totalPrice,
      subtotalPrice:thisCart.subtotalPrice,
      totalNumber: thisCart.totalNumber,
      deliveryFee: thisCart.deliveryFee,
      products: [],
    }
    for (let prod of thisCart.products){
      payload.products.push(prod.getData());
    }
    console.log('obiekt payload', payload);

  const options= {
    method:'POST',
    headers:{
      'Content-Type':'application/json',
    },
    body: JSON.stringify(payload)
  };
  fetch(url,options)
  .then(function(response) {
    return response.json();
  })
  .then(function(parsedResponse) {
    console.log('parsed response - sentOrder', parsedResponse);
  });
  }

  }
  export default Cart;