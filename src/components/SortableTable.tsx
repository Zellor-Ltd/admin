import { MenuOutlined } from "@ant-design/icons";
import { Table } from "antd";
import { TableProps } from "antd/lib/table";
import arrayMove from "array-move";
import { useEffect, useState } from "react";
import {
  SortableContainer as sortableContainer,
  SortableElement as sortableElement,
  SortableHandle as sortableHandle,
} from "react-sortable-hoc";

const DragHandle = sortableHandle(() => (
  <MenuOutlined style={{ cursor: "grab", color: "#999" }} />
));

const SortableItem = sortableElement((props: any) => <tr {...props} />);
const SortableContainer = sortableContainer((props: any) => (
  <tbody {...props} />
));

const SortableTable: React.FC<any> = (props: TableProps<any>) => {
  const { columns = [], dataSource = [] } = props;
  const [_dataSource, setDataSource] = useState<any>(dataSource);
  const sortableColumns = [
    {
      title: "Sort",
      dataIndex: "sort",
      width: "5%",
      className: "drag-visible",
      render: () => <DragHandle />,
    },
    ...columns,
  ];

  useEffect(() => {
    setDataSource(dataSource);
  }, [dataSource]);

  const onSortEnd = ({
    oldIndex,
    newIndex,
  }: {
    oldIndex: number;
    newIndex: number;
  }) => {
    if (oldIndex !== newIndex) {
      const newData = arrayMove(
        [].concat(_dataSource),
        oldIndex,
        newIndex
      ).filter((el) => !!el);
      console.log("Sorted items: ", newData);
      setDataSource(newData);
    }
  };

  const DraggableContainer = (props: any) => (
    <SortableContainer
      useDragHandle
      disableAutoscroll
      helperClass="row-dragging"
      onSortEnd={onSortEnd}
      {...props}
    />
  );

  const DraggableBodyRow = (props: any) => {
    // function findIndex base on Table rowKey props and should always be a right array index
    const index = _dataSource.findIndex(
      (x: any) => x.index === props["data-row-key"]
    );
    return <SortableItem index={index} {...props} />;
  };

  return (
    <Table
      {...props}
      pagination={false}
      dataSource={_dataSource}
      columns={sortableColumns}
      components={{
        body: {
          wrapper: DraggableContainer,
          row: DraggableBodyRow,
        },
      }}
    />
  );
};

export default SortableTable;
