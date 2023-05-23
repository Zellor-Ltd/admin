import React, {useEffect} from 'react';
import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import { Carousel } from 'react-responsive-carousel';

/* <Carousel  afterChange={onChange} >
{links.map((item) => {
  return (
    <div>
    <h3 className='carousel-item'>{item.id}</h3>
  </div>
)})}
</Carousel> */

export const SimpleCarousel = ({links}) => {

        return (
          <Carousel showThumbs={false}>
            {links.map((item, index) => {
            return (
              <div>
              <p>{index}</p>
            </div>)})}
            </Carousel>
        );
    }; 