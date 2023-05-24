import { Row } from 'antd';
import React from 'react';

interface CarouselItemProps {
    item: any;
}

const CarouselItem: React.FC<CarouselItemProps> = ({item}) => {

  return (
    <>
      <Row>
        <p>Type: {item.feed?.videoType?.map((type: string, index: number) => {if (index !== 0) {return `, ${type}`} else {return type}})}</p>
        <p>video placeholder (field: feed.package[0].videoUrl)</p>
        <p>thumb placeholder (field: feed.package[0].thumbnailUrl)</p>
        <p>{item.feed.shortDescription}</p>
        <p>
            <a href={item.feed.package[0].videoUrl}>
                {item.feed.package[0].videoUrl}
            </a>
        </p> 
      </Row>
    </>
  );
};

export default CarouselItem;
