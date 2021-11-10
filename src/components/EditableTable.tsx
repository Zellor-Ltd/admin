import { Table, ITableExportFields } from "ant-table-extensions";
import { ColumnType, TableProps } from "antd/lib/table";
import { EditableCell, EditableRow } from ".";

export type EditableColumnType<T> = ColumnType<T> & {
  editable?: boolean;
  number?: boolean;
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
        number: col.number,
        dataIndex: col.dataIndex,
        title: col.title,
        onSave: onSave,
      }),
    };
  });

  const fields: ITableExportFields = {
    id: "Id",
    name: "Name",
    masterBrand: {
      header: "Master Brand",
      formatter: (_fieldValue: any, record: any) => {
        if (typeof _fieldValue === "string") {
          return _fieldValue;
        }
        return record.brand.brandName;
      },
    },
    sku: "SKU",
    outOfStock: {
      header: "In Stock",
      formatter: (_fieldValue: any, record: any) => {
        if (_fieldValue) return "No";
        else return "Yes";
      },
    },
    originalPrice: "Original Price",
    maxDiscoDollars: "Max Disco Dollars",
    lastImportDate: "Last Import Date",
    productBrand: "Product Brand",
    lastGoLiveDate: "Last Go Live Date",
  };

  return (
    <Table
      {...props}
      exportable
      exportableProps={{
        fields,
        fileName: "Disco Products",
        showColumnPicker: true,
      }}
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
