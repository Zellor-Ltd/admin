import { Col, Form, Input, InputNumber, Modal, Row } from "antd";
import { useResetFormOnCloseModal } from "hooks/useResetFormCloseModal";
import { useEffect, useState } from "react";

interface EditProductModalProps {
  selectedItems: any[];
  visible: boolean;
  onCancel: () => void;
  onOk: () => void;
}

const EditProductModal: React.FC<EditProductModalProps> = ({
  selectedItems,
  visible,
  onCancel,
  onOk,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    form.resetFields();
  }, [form]);

  useResetFormOnCloseModal({
    form,
    visible,
  });

  const _onOk = () => {
    onOk();
    // form.submit();
  };

  return (
    <Modal
      title="Update Products"
      visible={visible}
      onOk={_onOk}
      onCancel={onCancel}
      width="300px"
      okButtonProps={{ loading: loading }}
      forceRender
    >
      <Form form={form} name="updateProducts" layout="vertical">
        <Input.Group>
          <Row gutter={8} justify="center">
            <Col>
              <Form.Item
                name="maxDiscoDollars"
                label="Max Discount"
                rules={[{ required: true }]}
              >
                <InputNumber />
              </Form.Item>
            </Col>
          </Row>
        </Input.Group>
      </Form>
    </Modal>
  );
};

export default EditProductModal;
