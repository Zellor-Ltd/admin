import { Col, Form, Input, InputNumber, Modal, Row } from 'antd';
import { useResetFormOnCloseModal } from 'hooks/useResetFormCloseModal';
import { Product } from 'interfaces/Product';
import { useEffect, useState } from 'react';
import { useRequest } from 'hooks/useRequest';
import { EditMultipleModalProps } from 'components/EditMultipleButton';

interface formValues {
  maxDiscoDollars: number;
}

const EditProductModal: React.FC<EditMultipleModalProps<Product>> = ({
  selectedItems: selectedProducts,
  visible,
  onCancel,
  onOk,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);
  const { doRequest } = useRequest({ setLoading });

  useEffect(() => {
    form.resetFields();
  }, [form]);

  useResetFormOnCloseModal({
    form,
    visible,
  });

  const _onOk = () => {
    form.validateFields().then(async ({ maxDiscoDollars }: formValues) => {
      const updatedProducts = selectedProducts.map(product => {
        product.maxDiscoDollars = maxDiscoDollars;
        return product;
      });
      // await doRequest(
      //   //() => updateManyProducts(updatedProducts),
      //   'Products updated.'
      // );
      // onOk();
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
