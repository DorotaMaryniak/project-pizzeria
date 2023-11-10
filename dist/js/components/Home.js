import {templates} from '../settings.js';
import {utils} from '../utils.js';

class Home {
    constructor (element){
        const thisHome = this;
        thisHome.render(element);
        //thisHome.getElements(element);
        //thisHome.initCarousel()
    }

/*getElements(element){
    const thisHome=this;
    thisHome.dom={};

    thisHome.dom.carousel=element.querySelector(select.containerOf.carousel)

}*/

    render(element) {
        const generatedHTML = templates.home();
        const generatedDOM = utils.createDOMFromHTML(generatedHTML);
        element.appendChild(generatedDOM)

    }

    /*initCarousel() {
        const thisHome=this;
            const options = {
              cellAlign: 'center',
              contain: true,
              autoPlay: 3000,
              wrapAround: true,
              prevNextButtons: false,
              groupCells: '1',
            };
            // eslint-disable-next-line no-undef
            console.log('carousel element', thisHome.dom.carousel)
            new Flickity(thisHome.dom.carousel, options);
          }*/
      }




export default Home;