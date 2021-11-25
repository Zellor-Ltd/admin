import React, {useCallback} from "react";
import {ImageDragAndDrop} from "./ImageDragAndDrop";
import {DndProvider} from "react-dnd";
import {HTML5Backend} from "react-dnd-html5-backend";
import {Col, Row, Space} from "antd";

interface ImagesDnDContainerProps {
  onOrder: CallableFunction;
  images: Array<any>;
}

export const ImagesDnDContainer: React.FC<ImagesDnDContainerProps> = (props) => {

  const {onOrder, images} = props;

  const moveCard = useCallback((dragIndex, hoverIndex) => {
    onOrder(dragIndex, hoverIndex);
  }, [images]);

  const renderImages = (image, index) => {
    return (
      <ImageDragAndDrop image={image} index={index} moveCard={moveCard} key={image.uid}/>
    );
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <Row>
        {images.map((image, i) => renderImages(image, i))}
      </Row>
    </DndProvider>
  );
};
