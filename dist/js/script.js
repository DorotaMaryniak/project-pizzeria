/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

const select = {
  templateOf: {
    menuProduct: "#template-menu-product",
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
        input: 'input[name="amount"]',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 0,
      defaultMax: 10,
    }
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
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

      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      console.log('formularz:',thisProduct.form);
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
      console.log('formularz inputy',thisProduct.formInputs);
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      console.log('cartButton',thisProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      console.log('całkowita cena:', thisProduct.priceElem);
    }
    initAccordion(){
      const thisProduct = this;
      /* find the clickable trigger (the element that should react to clickling)*/
      /* START: add event listener to clickable trigger on event click*/
      thisProduct.accordionTrigger.addEventListener('click', function(event)
      {
      /* prevent default action for event*/
       event.preventDefault();
      /* find active product (product that has active class)*/
      const activeProduct = document.querySelector(select.all.menuProductsActive);
      console.log('acitve product:',activeProduct);
      /* if there is active product and it's not thisProduct.element, remove class active from it*/

      if ((activeProduct !== null)  && (activeProduct !== thisProduct.element)) {
        activeProduct.classList.remove(classNames.menuProduct.wrapperActive);
      }

      /* toggle active class on thisProduct.element*/
       thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive);
      });
    }
initOrderForm(){
  const thisProduct = this;
  console.log('initOrderForm');

  thisProduct.form.addEventListener('submit', function(event){
    event.preventDefault();
    thisProduct.processOrder();
  });

  for(let input of thisProduct.formInputs){
    input.addEventListener('change', function(){
      thisProduct.processOrder();
    });

    thisProduct.cartButton.addEventListener('click', function(event){
      event.preventDefault();
      thisProduct.processOrder();
    });


  }

}

processOrder(){
 const thisProduct = this;
  console.log ('processOrder');
    // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
  const formData = utils.serializeFormToObject(thisProduct.form);
  console.log('formData', formData);

 // set price to default price
 let price = thisProduct.data.price;
 // for every category (param)...
 for(let paramId in thisProduct.data.params) {
  // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
  const param = thisProduct.data.params[paramId];
  console.log(paramId, param);

    // for every option in this category
    for(let optionId in param.options) {
      // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
      const option = param.options[optionId];
      console.log(optionId, option);
    }
  }


  // update calculated price in the HTML
  thisProduct.priceElem.innerHTML = price;


}
  }

  const app = {

    initMenu: function (){
      const thisApp = this;
      console.log('thisApp.data:', thisApp.data);

      for(let productData in thisApp.data.products){
        new Product(productData, thisApp.data.products[productData]);
      }

    },

    initData: function(){
      const thisApp = this;
      thisApp.data = dataSource;
    },

    init: function(){
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);

      thisApp.initData();
      thisApp.initMenu();
    },
  };


  app.init();

}
