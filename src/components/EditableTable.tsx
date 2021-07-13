import { Table } from "antd";
import { ColumnType, TableProps } from "antd/lib/table";
import { EditableCell, EditableRow } from ".";

export type EditableColumnType<T> = ColumnType<T> & {
  editable?: boolean;
};

export type ColumnTypesEscapeColumns = Exclude<
  Parameters<typeof Table>[0]["columns"],
  undefined
>;

type EditableTableProps<T> = Omit<TableProps<any>, "columns"> & {
  columns: EditableColumnType<T>[];
  onSave: Function;
};
const EditableTable: React.FC<EditableTableProps<any>> = (
  props: EditableTableProps<any>
) => {
  const { columns = [], onSave } = props;

  const configuredColumns = columns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record: any) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        onSave: onSave,
      }),
    };
  });

  return (
    <Table
      {...props}
      columns={configuredColumns as ColumnTypesEscapeColumns}
      components={{
        body: {
          row: EditableRow,
          cell: EditableCell,
        },
      }}
    />
  );
};

export default EditableTable;
