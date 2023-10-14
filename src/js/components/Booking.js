
import { select,templates} from '../settings.js';
import AmountWidget from './AmountWidget.js';

class Booking {
    constructor (element){
        const thisBooking = this;
        thisBooking.render(element);
       thisBooking.initWidgets();

    }

    render(element){
        const thisBooking = this;
        const generatedHTML = templates.bookingWidget();
        console.log('generatedHTML', generatedHTML);
        thisBooking.dom = {};
        thisBooking.dom.wrapper = element;
        thisBooking.dom.wrapper.innerHTML = generatedHTML;
       // console.log('bookingwrapper', element);
        thisBooking.dom.peopleAmount = element.querySelector(select.booking.peopleAmount);
        console.log('people amount input', thisBooking.dom.peopleAmount);
        thisBooking.dom.hoursAmount = element.querySelector(select.booking.hoursAmount);


    }
    initWidgets(){
        const thisBooking = this;
        thisBooking.peopleAmount=new AmountWidget(thisBooking.dom.peopleAmount);
        thisBooking.dom.peopleAmount.addEventListener('updated', function(){});
        console.log('action on peopole');
        thisBooking.hoursAmount=new AmountWidget(thisBooking.dom.hoursAmount);
        thisBooking.dom.hoursAmount.addEventListener('updated', function(){});
        console.log('action on hours');
    }
}

export default Booking;