import { MenuOutlined } from '@ant-design/icons';
import { Table } from 'antd';
import { TableProps } from 'antd/lib/table';
import arrayMove from 'array-move';
import {
  SortableContainer as sortableContainer,
  SortableElement as sortableElement,
  SortableHandle as sortableHandle,
} from 'react-sortable-hoc';

const DragHandle = sortableHandle(() => (
  <MenuOutlined style={{ cursor: 'grab', color: '#999' }} />
));

const SortableItem = sortableElement((props: any) => <tr {...props} />);
const SortableContainer = sortableContainer((props: any) => (
  <tbody {...props} />
));

type SortableTableProps = TableProps<any> & { setDataSource: Function };

const SortableTable: React.FC<SortableTableProps> = (
  props: SortableTableProps
) => {
  const { columns = [], setDataSource } = props;
  const dataSource =
    props.dataSource?.map((data, index) => {
      data.index = index;
      return data;
    }) || [];

  const sortableColumns = [
    {
      title: 'Sort',
      dataIndex: 'sort',
      width: '5%',
      className: 'drag-visible',
      render: () => <DragHandle />,
    },
    ...columns,
  ];

  const onSortEnd = ({
    oldIndex,
    newIndex,
  }: {
    oldIndex: number;
    newIndex: number;
  }) => {
    if (oldIndex !== newIndex) {
      const newData = arrayMove([...dataSource], oldIndex, newIndex).filter(
        el => !!el
      );
      setDataSource(newData);
    }
  };

  const DraggableContainer = (_props: any) => (
    <SortableContainer
      useDragHandle
      disableAutoscroll
      helperClass="row-dragging"
      onSortEnd={onSortEnd}
      {..._props}
    />
  );

  const DraggableBodyRow = ({
    className,
    style,
    ...restProps
  }: {
    className: any;
    style: any;
    'data-row-key': any;
  }) => {
    // function findIndex based on Table rowKey props and should always be a right array index
    const index = dataSource.findIndex(
      (x: any) => x.index === restProps['data-row-key']
    );
    return <SortableItem index={index} {...restProps} />;
  };

  return (
    <Table
      {...props}
      rowKey="index"
      pagination={false}
      dataSource={dataSource}
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
