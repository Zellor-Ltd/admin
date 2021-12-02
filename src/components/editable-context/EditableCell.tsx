import { Form, Input, InputNumber } from 'antd';
import { useContext, useEffect, useRef, useState } from 'react';
import EditableContext from './EditableContext';

interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
  title: any;
  editable: boolean;
  children: React.ReactNode;
  dataIndex: keyof TablePropsInterface;
  record: TablePropsInterface;
  number: boolean;
  onSave: (record: TablePropsInterface) => void;
}

interface TablePropsInterface {}

const EditableCell: React.FC<EditableCellProps> = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  onSave,
  number,
  ...restProps
}) => {
  const [editing, setEditing] = useState(false);
  let inputRef = useRef<Input>(null);
  let inputNumberRef = useRef<HTMLInputElement>(null);
  const form = useContext(EditableContext)!;

  useEffect(() => {
    if (editing) {
      if (number) {
        inputNumberRef.current!.focus();
      } else {
        inputRef.current!.focus();
      }
    }
  }, [editing, number]);

  const toggleEdit = () => {
    setEditing(!editing);
    form.setFieldsValue({ [dataIndex]: record[dataIndex] });
  };

  const save = async () => {
    try {
      const values = await form.validateFields();

      toggleEdit();
      onSave({ ...record, ...values });
    } catch (errInfo) {
      console.log('Save failed:', errInfo);
    }
  };

  let childNode = children;

  if (editable) {
    childNode = editing ? (
      <Form.Item
        style={{ margin: 0 }}
        name={dataIndex}
        rules={[
          {
            required: true,
            message: `${title} is required.`,
          },
        ]}
      >
        {number ? (
          <InputNumber ref={inputNumberRef} onPressEnter={save} onBlur={save} />
        ) : (
          <Input ref={inputRef} onPressEnter={save} onBlur={save} />
        )}
      </Form.Item>
    ) : (
      <div
        className="editable-cell-value-wrap"
        // I believe this paddingRight only makes sense when the column is aligned at left.
        // style={{ paddingRight: 24 }}
        onClick={toggleEdit}
      >
        {children}
      </div>
    );
  }

  return <td {...restProps}>{childNode}</td>;
};

export default EditableCell;
