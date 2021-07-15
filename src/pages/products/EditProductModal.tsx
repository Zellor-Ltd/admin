import { Col, Form, Input, InputNumber, Modal, Row } from "antd";
import { sleep } from "helpers/utils";
import { useResetFormOnCloseModal } from "hooks/useResetFormCloseModal";
import { Product } from "interfaces/Product";
import { useEffect, useState } from "react";

interface EditProductModalProps {
  selectedProducts: Product[];
  visible: boolean;
  onCancel: () => void;
  onOk: Function;
}

const EditProductModal: React.FC<EditProductModalProps> = ({
  selectedProducts,
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
    form.validateFields().then(async (values) => {
      setLoading(true);
      await sleep(1000);
      setLoading(false);
      onOk();
      form.resetFields();
    });
  };

  return (
    <Modal
      title="Update Products"
      visible={visible}
      okText="Save"
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
