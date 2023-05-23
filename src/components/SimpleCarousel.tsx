import React from 'react';
import { Carousel } from 'antd';
import { FeedItem } from 'interfaces/FeedItem';

export const SimpleCarousel: React.FC<{
    content: any[]
  }> = ({ content }) => {  
    
/*   const onChange = (currentSlide: number) => {
    console.log(currentSlide);
  }; */

  return (
    <Carousel /* afterChange={onChange} */>
      {content.map((item) => {
        return (
          <div>
          <h3 className='carousel-item'>{item.id}</h3>
        </div>
      )})}
    </Carousel>
  );

};