import { Col, Form, Input, InputNumber, Modal, Row } from "antd";
import { Brand } from "interfaces/Brand";
import { useEffect } from "react";
import { useResetFormOnCloseModal } from "./useResetFormCloseModal";

interface ModalFormProps {
  brand: Brand | undefined;
  visible: boolean;
  onCancel: () => void;
}

const ModalBrand: React.FC<ModalFormProps> = ({ brand, visible, onCancel }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    form.resetFields();
  }, [brand, form]);

  useResetFormOnCloseModal({
    form,
    visible,
  });

  const onOk = () => {
    form.submit();
  };

  return (
    <Modal
      title="Brand"
      visible={visible}
      onOk={onOk}
      onCancel={onCancel}
      width={"80%"}
      forceRender>
      <Form form={form} name="brandForm" initialValues={brand}>
        <Input.Group>
          <Row gutter={8}>
            <Col lg={8} xs={24}>
              <Form.Item name="brandId" label="Brand ID">
                <Input disabled />
              </Form.Item>
            </Col>
            <Col lg={8} xs={24}>
              <Form.Item name="productId" label="Product ID">
                <Input disabled />
              </Form.Item>
            </Col>
            <Col lg={8} xs={24}>
              <Form.Item name="brandName" label="Brand Name">
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={8}>
            <Col lg={24}>
              <Form.Item name="brandLogoUrl" label="Brand Logo Url">
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={8}>
            <Col lg={4} xs={24}>
              <Form.Item name="startTime" label="Start Time">
                <InputNumber style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col lg={4} xs={24}>
              <Form.Item name="duration" label="Duration">
                <InputNumber style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col lg={4} xs={24}>
              <Form.Item
                name="opacity"
                label="Opacity"
                // rules={[{ required: true }]}
              >
                <InputNumber style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col lg={4} xs={24}>
              <Form.Item
                name="x"
                label="Position X"
                // rules={[{ required: true }]}
              >
                <InputNumber style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col lg={4} xs={24}>
              <Form.Item
                name="y"
                label="Position Y"
                // rules={[{ required: true }]}
              >
                <InputNumber style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col lg={4} xs={24}>
              <Form.Item
                name="z"
                label="Z Index"
                // rules={[{ required: true }]}
              >
                <InputNumber style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>
        </Input.Group>
      </Form>
    </Modal>
  );
};

export default ModalBrand;
