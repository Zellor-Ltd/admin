import { EditableCell, EditableRow } from "components";
import { DeleteOutlined } from "@ant-design/icons";
import { Position } from "interfaces/Position";
import { ColumnTypes } from "components/editable-context";
import { RouteComponentProps } from "react-router";
import Title from "antd/lib/typography/Title";
import {
  Button,
  Col,
  Form,
  Input,
  InputNumber,
  PageHeader,
  Popconfirm,
  Row,
  Select,
  Table,
} from "antd";

const { Option } = Select;

const components = {
  body: {
    row: EditableRow,
    cell: EditableCell,
  },
};

const TagDetail: React.FC<RouteComponentProps> = (props) => {
  const { history, location } = props;
  const initial: any = location.state;

  const [form] = Form.useForm();

  const onDeletePosition = (index: number) => {
    const positions = form.getFieldValue("position").slice();
    positions.splice(index, 1);
    form.setFieldsValue({ position: positions });
  };

  const onSavePosition = (row: Position, index: number) => {
    const positions = form.getFieldValue("position").slice();
    const item = positions[index];
    positions.splice(index, 1, {
      ...item,
      ...row,
    });
    form.setFieldsValue({ position: positions });
  };

  const onAddMoviments = () => {
    const positions = form.getFieldValue("position");
    form.setFieldsValue({
      position: [
        ...positions,
        {
          startTime: 0,
          opacity: 0,
          x: 0,
          y: 0,
          z: 0,
        },
      ],
    });
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
      render: (_: any, record: Position, index: number) => (
        <Popconfirm
          title="Sure to delete?"
          onConfirm={() => onDeletePosition(index)}>
          <Button type="link" style={{ padding: 0, margin: 6 }}>
            <DeleteOutlined />
          </Button>
        </Popconfirm>
      ),
    },
  ];

  const configuredColumns = columns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record: Position, index: number) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        number: col.number,
        onSave: (newPosition: Position) => onSavePosition(newPosition, index),
      }),
    };
  });

  return (
    <>
      <PageHeader title="Tag Update" subTitle="Tag" />
      <Form form={form} name="tagForm" initialValues={initial}>
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
          onClick={onAddMoviments}>
          Add Moviments
        </Button>
        <Title level={3}>Moviment</Title>
        <Form.Item
          shouldUpdate={(prevValues, curValues) =>
            prevValues.position !== curValues.position
          }>
          {({ getFieldValue }) => {
            const positions: Position[] = getFieldValue("position") || [];

            return (
              <Table
                rowKey={(position: Position) =>
                  `position_${position.x}_${position.z}_${Math.random()}`
                }
                title={() => "Tag Motion"}
                components={components}
                rowClassName={() => "editable-row"}
                bordered
                dataSource={positions}
                columns={configuredColumns as ColumnTypes}
              />
            );
          }}
        </Form.Item>

        <Button type="default" onClick={() => history.push("/tags")}>
          Cancel
        </Button>
        <Button type="primary" htmlType="submit">
          Save Changes
        </Button>
      </Form>
    </>
  );
};

export default TagDetail;
