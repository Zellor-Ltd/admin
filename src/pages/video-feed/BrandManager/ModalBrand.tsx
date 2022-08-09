import { Col, Form, Input, InputNumber, Modal, Row, Select } from 'antd';
import { Brand } from 'interfaces/Brand';
import { useEffect, useState } from 'react';
import { fetchBrands } from 'services/DiscoClubService';
import { useResetFormOnCloseModal } from 'hooks/useResetFormCloseModal';

interface ModalFormProps {
  brand: Brand | undefined;
  visible: boolean;
  onCancel: () => void;
}

const ModalBrand: React.FC<ModalFormProps> = ({ brand, visible, onCancel }) => {
  const [form] = Form.useForm();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedBrand, setselectedBrand] = useState<Brand | undefined>();

  useEffect(() => {
    form.resetFields();
  }, [brand, form]);

  useEffect(() => {
    let mounted = true;
    async function getBrands() {
      const response: any = await fetchBrands();
      if (mounted) {
        setBrands(response.results);
        setLoading(false);
      }
    }
    setLoading(true);
    getBrands();
    return () => {
      mounted = false;
    };
  }, []);

  useResetFormOnCloseModal({
    form,
    visible,
  });

  const onOk = () => {
    form.setFieldsValue({ ...selectedBrand });
    form.submit();
  };

  const onChangeBrand = (key: string) => {
    setselectedBrand(brands.find(brand => brand.id === key));
  };

  return (
    <Modal
      title="Brand"
      visible={visible}
      onOk={onOk}
      onCancel={onCancel}
      width={'80%'}
      okButtonProps={{ loading: loading }}
      forceRender
    >
      <Form
        form={form}
        name="brandForm"
        initialValues={brand}
        layout="vertical"
      >
        <Input.Group>
          <Row gutter={8}>
            <Col lg={6} xs={0}>
              <Form.Item name="brandName" label="Brand">
                <Select onChange={onChangeBrand}>
                  {brands.map(brand => (
                    <Select.Option key={brand.id} value={brand.id}>
                      {brand.brandName}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col lg={6} xs={24}>
              <Form.Item name="startTime" label="Start Time">
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col lg={6} xs={24}>
              <Form.Item name="duration" label="Duration">
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col lg={6} xs={24}>
              <Form.Item name="opacity" label="Opacity">
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col lg={8} xs={24}>
              <Form.Item name="x" label="Position X">
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col lg={8} xs={24}>
              <Form.Item name="y" label="Position Y">
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col lg={8} xs={24}>
              <Form.Item name="z" label="Z Index">
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
        </Input.Group>
      </Form>
    </Modal>
  );
};

export default ModalBrand;
