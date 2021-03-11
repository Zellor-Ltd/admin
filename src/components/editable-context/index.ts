import { Table } from "antd";
import EditableCell from "./EditableCell";
import EditableContext from "./EditableContext";
import EditableRow from "./EditableRow";

type EditableTableProps = Parameters<typeof Table>[0];

export type ColumnTypes = Exclude<EditableTableProps["columns"], undefined>;

export { EditableContext, EditableRow, EditableCell };
