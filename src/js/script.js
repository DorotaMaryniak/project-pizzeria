/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

const select = {
  templateOf: {
    menuProduct: "#template-menu-product",
    cartProduct: '#template-cart-product',
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input.amount',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },

  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    cart: {
      wrapperActive: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 0,
      defaultMax: 9,
    },
    cart: {
      defaultDeliveryFee: 20,
    },

    db: {
      url: '//localhost:3131',
      products: 'products',
      orders: 'orders',
    },
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
  };

  class Product{
    constructor (id, data) {
      const thisProduct = this;
      thisProduct.id = id;
      thisProduct.data = data;
      thisProduct.renderInMenu();
      thisProduct.getElements();
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
      thisProduct.initAmountWidget();
      thisProduct.processOrder();
      console.log('new Product;', thisProduct);
    }
    renderInMenu(){
      const thisProduct = this;
      /* generate HTML based on template*/
       const generatedHTML = templates.menuProduct(thisProduct.data);

      /* create element using utils.createElementFromHTML*/
      thisProduct.element = utils.createDOMFromHTML(generatedHTML);

      /* find menu container */
      const menuContainer = document.querySelector(select.containerOf.menu);

      /* add element to menu */
      menuContainer.appendChild(thisProduct.element);

    }

    getElements(){
      const thisProduct = this;
      thisProduct.dom={

      accordionTrigger: thisProduct.element.querySelector(select.menuProduct.clickable),
      form: thisProduct.element.querySelector(select.menuProduct.form),
      formInputs: thisProduct.element.querySelectorAll(select.all.formInputs),
      cartButton: thisProduct.element.querySelector(select.menuProduct.cartButton),
      priceElem: thisProduct.element.querySelector(select.menuProduct.priceElem),
      imageWrapper: thisProduct.element.querySelector(select.menuProduct.imageWrapper),
      amountWidgetElem: thisProduct.element.querySelector(select.menuProduct.amountWidget),
      }
    }
    initAccordion(){
      const thisProduct = this;
      /* find the clickable trigger (the element that should react to clickling)*/
      /* START: add event listener to clickable trigger on event click*/
      thisProduct.dom.accordionTrigger.addEventListener('click', function(event)
      {
      /* prevent default action for event*/
       event.preventDefault();
      /* find active product (product that has active class)*/
      const activeProduct = document.querySelector(select.all.menuProductsActive);
     // console.log('acitve product:',activeProduct);
      /* if there is active product and it's not thisProduct.element, remove class active from it*/

      if ((activeProduct !== null)  && (activeProduct !== thisProduct.element)) {
        activeProduct.classList.remove(classNames.menuProduct.wrapperActive);
      }

      /* toggle active class on thisProduct.element*/
       thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive);
      });
    }

    initAmountWidget(){
      const thisProduct = this;
      thisProduct.amountWidget=new AmountWidget(thisProduct.dom.amountWidgetElem);
      thisProduct.dom.amountWidgetElem.addEventListener('updated', function(){thisProduct.processOrder()});
    }

initOrderForm(){
  const thisProduct = this;
 // console.log('initOrderForm');

  thisProduct.dom.form.addEventListener('submit', function(event){
    event.preventDefault();
    thisProduct.processOrder();
  });

  for(let input of thisProduct.dom.formInputs){
    input.addEventListener('change', function(){
      thisProduct.processOrder();
    });
  }

    thisProduct.dom.cartButton.addEventListener('click', function(event){
      event.preventDefault();
      thisProduct.processOrder();
      thisProduct.addToCart();
    });




}

processOrder(){
 const thisProduct = this;
  //console.log ('processOrder');
    // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
  const formData = utils.serializeFormToObject(thisProduct.dom.form);
  //console.log('formData', formData);

 // set price to default price
 let price = thisProduct.data.price;
 // for every category (param)...
 for(let paramId in thisProduct.data.params) {
  // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
  const param = thisProduct.data.params[paramId];
  //console.log('param:',paramId, param);



    // for every option in this category
    for(let optionId in param.options) {
      // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
       const option = param.options[optionId];
       // console.log('opcje',optionId, option);
       // const dane = formData[paramId];
        //console.log('dane',dane);
        const optionImage = thisProduct.dom.imageWrapper.querySelector('.'+ paramId + '-' + optionId);
       // console.log('opcje obrazka:', optionImage);
        const optionsSelected = formData[paramId]&&formData[paramId].includes(optionId);
        if(optionsSelected){
          if(!option.default){
            price +=option.price;
            }
          if (optionImage){
            optionImage.classList.add (classNames.menuProduct.imageVisible);
          }

        }
        else{
          if(option.default){
            price -= option.price;
          }
          if (optionImage){
          optionImage.classList.remove (classNames.menuProduct.imageVisible);
          }
        }
      }
 }
 thisProduct.priceSingle=price;
  /*multiply price by amount*/
  price*=thisProduct.amountWidget.value;

  // update calculated price in the HTML
  thisProduct.dom.priceElem.innerHTML = price;


}
addToCart(){
  const thisProduct = this;
  app.cart.add(thisProduct.prepareCartProduct());
}
prepareCartProduct(){
const thisProduct = this;
const productSummary = {
  id: thisProduct.id,
  name: thisProduct.data.name,
  amount: thisProduct.amountWidget.value,
  priceSingle: thisProduct.priceSingle,
  price:  thisProduct.priceSingle * thisProduct.amountWidget.value,
  params: thisProduct.prepareCartProductParams(),

};
return productSummary;

}

prepareCartProductParams(){
  const thisProduct = this;
  //console.log ('processOrder');
    // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
  const formData = utils.serializeFormToObject(thisProduct.dom.form);
  //console.log('formData', formData);

const params = {};
 // for every category (param)...
 for(let paramId in thisProduct.data.params) {
  // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
  const param = thisProduct.data.params[paramId];
 // console.log('param koszyk:',paramId,param);
params[paramId]={
  label: param.label,
  options:{}
}


    // for every option in this category
    for(let optionId in param.options) {
      // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
       const option = param.options[optionId];
      // console.log('opcje koszyka',optionId, option);

        const optionsSelected = formData[paramId]&&formData[paramId].includes(optionId);
        if(optionsSelected){
          params[paramId].options[optionId]=option.label;
        }

      }
 }

//console.log('obiekt koszyka',params);
return params;

}

  }

class AmountWidget {
  constructor(element){
    const thisWidget = this;

   // console.log ('AmountWidget:', thisWidget);
   //console.log ('constructor arguments:', element);
    thisWidget.getElements(element);
    thisWidget.initActions();
    if (thisWidget.input.value)
    {
    thisWidget.setValue(thisWidget.input.value);}
    else
    {thisWidget.setValue(settings.amountWidget.defaultValue);}

  }
  getElements(element){
    const thisWidget = this;

    thisWidget.element = element;
    thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
    thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
  }

initActions(){
  const thisWidget = this;
  thisWidget.input.addEventListener('change', function () {thisWidget.setValue(thisWidget.input.value);
  });
  thisWidget.linkDecrease.addEventListener('click',function(event){
    event.preventDefault();
    thisWidget.setValue(thisWidget.value - 1);
  });
  thisWidget.linkIncrease.addEventListener('click',function(event){
    event.preventDefault();
    thisWidget.setValue(thisWidget.value + 1);
  });
}
announce() {
  const thisWidget = this;

  const event = new CustomEvent ('updated', {bubbles : true});
  thisWidget.element.dispatchEvent(event);
}



  setValue(value){
    const thisWidget = this;
    console.log('thisWidget',thisWidget);
    const newValue = parseInt(value);


    /*TODO: Add validation*/
    if (thisWidget.value!== newValue && !isNaN(newValue)&& (newValue>=settings.amountWidget.defaultMin && newValue<=settings.amountWidget.defaultMax))
    {
      thisWidget.value = newValue;
      console.log('thisWidgetvalue',thisWidget.value);}

    thisWidget.input.value = thisWidget.value;
    thisWidget.announce();
  }

}

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
    const thisCart = this;
    console.log ('opcje koszyka',thisCart);
    let deliveryFee = settings.cart.defaultDeliveryFee;
    let totalNumber = 0;
    let subtotalPrice = 0;

    for (let product of thisCart.products){
      console.log('tablica z produktami', thisCart.products);
      totalNumber += product.amount;
      console.log('liczba sztuk w koszyku',totalNumber);
      subtotalPrice += product.price;
      console.log('cena bez dostawy koszyka', subtotalPrice);
    }
    if(totalNumber!==0){
    thisCart.totalPrice = subtotalPrice + deliveryFee;
    console.log('cena z dostawa koszyka', thisCart.totalPrice);}
    else {
      deliveryFee = 0;
      thisCart.totalPrice=0;
    }

    thisCart.dom.deliveryFee.innerHTML = deliveryFee;
    thisCart.dom.subtotalPrice.innerHTML = subtotalPrice;
    thisCart.dom.totalNumber.innerHTML = totalNumber;
    for (let price of thisCart.dom.totalPrice){
      price.innerHTML = thisCart.totalPrice;
    }

  }
}

class CartProduct{
  constructor(menuProduct,element){
    const thisCartProduct = this;

    thisCartProduct.id = menuProduct.id;
    thisCartProduct.name= menuProduct.name;
    thisCartProduct.amount= menuProduct.amount;
    thisCartProduct.priceSingle= menuProduct.priceSingle;
    thisCartProduct.price= menuProduct.price;
    thisCartProduct.params=menuProduct.params;

    thisCartProduct.getElements(element);
    console.log('thisCartProduct',thisCartProduct);
    thisCartProduct.initAmountWidget();
    thisCartProduct.initActions();
  }
  getElements(element){
    const thisCartProduct = this;
    thisCartProduct.dom = {};
    thisCartProduct.dom.wrapper = element;
    thisCartProduct.dom.amountWidget = element.querySelector(select.cartProduct.amountWidget);
    thisCartProduct.dom.price = element.querySelector(select.cartProduct.price);
    thisCartProduct.dom.edit = element.querySelector(select.cartProduct.edit);
    thisCartProduct.dom.remove = element.querySelector(select.cartProduct.remove);
  }
  initAmountWidget(){
    const thisCartProduct = this;
    thisCartProduct.amountWidget=new AmountWidget(thisCartProduct.dom.amountWidget);
    //console.log('wyswietlony widget', thisCartProduct.amountWidget);
    thisCartProduct.dom.amountWidget.addEventListener('updated', function(){
    thisCartProduct.amount = thisCartProduct.amountWidget.value;
    thisCartProduct.price = thisCartProduct.amount * thisCartProduct.priceSingle;
    thisCartProduct.dom.price.innerHTML=thisCartProduct.price });
  }

  remove(){
    const thisCartProduct = this;
    const event = new CustomEvent ('remove',{
      bubbles: true,
      detail: {
        cartProduct: thisCartProduct,
      },
    }) ;
    thisCartProduct.dom.wrapper.dispatchEvent(event);
    console.log('metoda remove');
  }

  initActions(){
   const thisCartProduct = this;
    thisCartProduct.dom.edit.addEventListener('click',function(event){
      event.preventDefault();
    });

    thisCartProduct.dom.remove.addEventListener('click',function(event){
      event.preventDefault();
      thisCartProduct.remove();
    });

  }
}
  const app = {

    initMenu: function (){
      const thisApp = this;
      console.log('thisApp.data:', thisApp.data);

      for(let productData in thisApp.data.products){
        new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
      }

    },

    initData: function(){
      const thisApp = this;
      thisApp.data = {};
      const url = settings.db.url + '/' + settings.db.products;
      fetch(url)
        .then(function(rawResponse){
          return rawResponse.json();
         })
        .then(function(parsedResponse){
          console.log('parsedResponse',parsedResponse);
          thisApp.data.products = parsedResponse;
          thisApp.initMenu();
        });
        console.log('thisApp.data',JSON.stringify(thisApp.data));
    },

    initCart: function(){
      const thisApp = this;
      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem);
    },


    init: function(){
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);

      thisApp.initData();
      //thisApp.initMenu();
      thisApp.initCart();
    },
  };


  app.init();

}
