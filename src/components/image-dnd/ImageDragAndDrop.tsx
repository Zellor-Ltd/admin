import React, {useRef} from "react";
import {useDrag, useDrop} from 'react-dnd';
import {XYCoord} from "react-dnd/dist/types/types/monitors";
import {Image} from "../../interfaces/Image";
import {Col} from "antd";
import './ImageDragAndDrop.scss'

interface ImageDragAndDropProps {
  image: Image;
  index: number;
  moveCard: any;
}

export const ImageDragAndDrop: React.FC<ImageDragAndDropProps> = (props) => {

  const {image, index, moveCard} = props;
  const ref = useRef<any>(null);

  const [{handlerId}, drop] = useDrop({
    accept: 'IMAGE',
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: any, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;
      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }
      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      // Get vertical middle
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      // Determine mouse position
      const clientOffset = monitor.getClientOffset() as XYCoord;
      // Get pixels to the top
      const hoverClientY = clientOffset?.y - hoverBoundingRect.top;
      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%
      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }
      // Time to actually perform the action
      moveCard(dragIndex, hoverIndex);
      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex;
    },
  });

  const [{isDragging}, drag] = useDrag({
    type: 'IMAGE',
    item: () => {
      return {id: image.uid, index};
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const opacity = isDragging ? 0 : 1;
  drag(drop(ref));

  return (
    <Col lg={2} className="dnd-margin">
      <div ref={ref} className="dnd-image-container" style={{opacity}} data-handler-id={handlerId}>
        <img src={image.url} className="dnd-image"/>
      </div>
    </Col>
  );
};
