import React, { useContext, useEffect, useRef, useState } from "react";
import {
  Button,
  Col,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Row,
  Select,
  Table,
} from "antd";
import { Position } from "interfaces/Position";
import { Tag } from "interfaces/Tag";
import { useResetFormOnCloseModal } from "./useResetFormCloseModal";
import { EditableContext } from "components";
import { DeleteOutlined } from "@ant-design/icons";
const { Option } = Select;

type EditableTableProps = Parameters<typeof Table>[0];

type ColumnTypes = Exclude<EditableTableProps["columns"], undefined>;

interface ModalFormProps {
  tag: Tag | undefined;
  visible: boolean;
  selectedPositions: Position[];
  onCancel: () => void;
  onDeletePosition: (index: number) => void;
  onSavePosition: (row: Position) => void;
  onAddPosition: () => void;
}

interface EditableRowProps {
  index: number;
}

interface EditableCellProps {
  title: React.ReactNode;
  editable: boolean;
  children: React.ReactNode;
  dataIndex: keyof Position;
  record: Position;
  number: boolean;
  onSave: (record: Position) => void;
}

const EditableRow: React.FC<EditableRowProps> = ({ index, ...props }) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};

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
      console.log("Save failed:", errInfo);
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
        ]}>
        {number ? (
          <InputNumber ref={inputNumberRef} onPressEnter={save} onBlur={save} />
        ) : (
          <Input ref={inputRef} onPressEnter={save} onBlur={save} />
        )}
      </Form.Item>
    ) : (
      <div
        className="editable-cell-value-wrap"
        style={{ paddingRight: 24 }}
        onClick={toggleEdit}>
        {children}
      </div>
    );
  }

  return <td {...restProps}>{childNode}</td>;
};

const ModalTag: React.FC<ModalFormProps> = ({
  tag,
  visible,
  selectedPositions,
  onCancel,
  onDeletePosition,
  onSavePosition,
  onAddPosition,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    form.resetFields();
  }, [tag, form]);

  useResetFormOnCloseModal({
    form,
    visible,
  });

  const onOk = () => {
    form.submit();
  };

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };

  const columns = [
    {
      title: "Start time",
      dataIndex: "startTime",
      editable: true,
      number: true,
    },
    {
      title: "Opacity",
      dataIndex: "opacity",
      editable: true,
      number: true,
    },
    {
      title: "Position X",
      dataIndex: "x",
      editable: true,
      number: true,
    },
    {
      title: "Position Y",
      dataIndex: "y",
      editable: true,
      number: true,
    },
    {
      title: "Z Index",
      dataIndex: "z",
      editable: true,
      number: true,
    },
    {
      title: "actions",
      dataIndex: "actions",
      render: (_: any, record: Position, index: number) =>
        selectedPositions.length >= 1 ? (
          <Popconfirm
            title="Sure to delete?"
            onConfirm={() => onDeletePosition(index)}>
            <Button type="link" style={{ padding: 0, margin: 6 }}>
              <DeleteOutlined />
            </Button>
          </Popconfirm>
        ) : null,
    },
  ];

  const configuredColumns = columns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record: Position) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        number: col.number,
        onSave: onSavePosition,
      }),
    };
  });

  return (
    <Modal
      title="Tag"
      visible={visible}
      onOk={onOk}
      onCancel={onCancel}
      width={"80%"}
      forceRender>
      <Form form={form} name="tagForm" initialValues={tag}>
        <Input.Group>
          <Row gutter={8}>
            <Col lg={8} xs={24}>
              <Form.Item name="tagId" label="Tag id">
                <Input />
              </Form.Item>
            </Col>
            <Col lg={8} xs={24}>
              <Form.Item name="productId" label="Product Id">
                <Input />
              </Form.Item>
            </Col>
            <Col lg={8} xs={24}>
              <Form.Item name="productName" label="Product Name">
                <Input />
              </Form.Item>
            </Col>
          </Row>
        </Input.Group>
        <Input.Group>
          <Row gutter={8}>
            <Col xxl={16} md={12} xs={24}>
              <Form.Item name="productImageUrl" label="Product Image URL">
                <Input />
              </Form.Item>
            </Col>
            <Col xxl={4} md={6} xs={24}>
              <Form.Item name="productPrice" label="Product Price">
                <InputNumber style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col xxl={4} md={6}>
              <Form.Item name="productDiscount" label="Product Discount">
                <InputNumber style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>
        </Input.Group>
        <Input.Group>
          <Row gutter={8}>
            <Col xxl={6} md={12} xs={24}>
              <Form.Item name="startTime" label="Start Time">
                <InputNumber style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col xxl={6} md={12} xs={24}>
              <Form.Item name="duration" label="Duration">
                <InputNumber style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col xxl={6} md={12} xs={24}>
              <Form.Item name="template" label="Template">
                <Select placeholder="Please select a template">
                  <Option value="product">Product</Option>
                  <Option value="dollar">Dollar</Option>
                  <Option value="gold">Gold</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xxl={6} md={12} xs={24}>
              <Form.Item name="clickSound" label="Click Sound">
                <Select placeholder="Please select a click sound">
                  <Option value="beep">Beep</Option>
                  <Option value="bell">Bell</Option>
                  <Option value="silent">Silent</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Input.Group>
        <Input.Group>
          <Row gutter={8}>
            <Col xxl={12} md={12} xs={24}>
              <Form.Item
                name="discoGold"
                label="Disco Gold"
                // rules={[{ required: true }]}
              >
                <InputNumber style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col xxl={12} md={12} xs={24}>
              <Form.Item
                name="discoDollars"
                label="Disco Gold"
                // rules={[{ required: true }]}
              >
                <InputNumber style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>
        </Input.Group>

        <Button
          type="primary"
          style={{ margin: "8px 0" }}
          onClick={() => onAddPosition()}>
          Add Movments
        </Button>
        <Table
          rowKey={(position: Position) =>
            `posotion_${position.x}_${position.z}`
          }
          title={() => "Tag Motion"}
          components={components}
          rowClassName={() => "editable-row"}
          bordered
          dataSource={selectedPositions}
          columns={configuredColumns as ColumnTypes}
        />
      </Form>
    </Modal>
  );
};

export default ModalTag;
