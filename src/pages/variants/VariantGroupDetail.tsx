import { Button, Col, Form, Input, InputNumber, PageHeader, Row } from 'antd';
import { useRequest } from 'hooks/useRequest';
import { VariantGroup } from 'interfaces/VariantGroup';
import { useContext, useEffect, useState } from 'react';
import { AppContext } from 'contexts/AppContext';
import {
  fetchProductBrands,
  saveVariantGroup,
} from 'services/DiscoClubService';
import { ProductBrand } from 'interfaces/ProductBrand';
import SimpleSelect from 'components/select/SimpleSelect';
import { SelectOption } from 'interfaces/SelectOption';

interface VariantGroupDetailProps {
  variantGroup: VariantGroup | undefined;
  onSave?: (record: VariantGroup) => void;
  onCancel?: () => void;
}

const VariantGroupDetail: React.FC<VariantGroupDetailProps> = ({
  variantGroup,
  onSave,
  onCancel,
}) => {
  const { isMobile } = useContext(AppContext);
  const [loading, setLoading] = useState<boolean>(false);
  const [form] = Form.useForm();
  const { doFetch, doRequest } = useRequest({ setLoading });
  const [productBrands, setProductBrands] = useState<ProductBrand[]>([]);

  const optionMapping: SelectOption = {
    key: 'id',
    label: 'brandName',
    value: 'id',
  };

  useEffect(() => {
    getProductBrands();
  }, []);

  const getProductBrands = async () => {
    const { results }: any = await doFetch(() => fetchProductBrands());
    setProductBrands(results);
  };

  const onFinish = async () => {
    const variantGroupForm = form.getFieldsValue(true);
    const { result } = await doRequest(() =>
      saveVariantGroup(variantGroupForm)
    );
    variantGroupForm.id
      ? onSave?.(variantGroupForm)
      : onSave?.({ ...variantGroupForm, id: result });
  };

  return (
    <>
      <PageHeader
        title={
          variantGroup ? `${variantGroup.name} Update` : 'New Variant Group'
        }
      />
      <Form
        name="form"
        layout="vertical"
        form={form}
        initialValues={variantGroup}
        onFinish={onFinish}
      >
        <Row gutter={8}>
          <Col lg={12} xs={24}>
            <Col lg={16} xs={24}>
              <Form.Item
                label="Name"
                name="name"
                rules={[{ required: true, message: `Name is required.` }]}
              >
                <Input placeholder="Enter a unique name" />
              </Form.Item>
            </Col>
            <Col lg={16} xs={24}>
              <Form.Item
                name="productBrand"
                label="Product Brand"
                rules={[
                  {
                    required: true,
                    message: `Product Brand is required.`,
                  },
                ]}
              >
                <SimpleSelect
                  data={productBrands}
                  style={{ width: '100%' }}
                  selectedOption={variantGroup?.productBrand?.brandName}
                  optionMapping={optionMapping}
                  placeholder="Select a brand"
                  loading={loading}
                  disabled={loading}
                  allowClear
                ></SimpleSelect>
              </Form.Item>
            </Col>
          </Col>
        </Row>
        <Row gutter={8} justify={isMobile ? 'end' : undefined}>
          <Col>
            <Button
              type="default"
              onClick={() => onCancel?.()}
              className="my-1"
            >
              Cancel
            </Button>
          </Col>
          <Col>
            <Col>
              <Button
                loading={loading}
                type="primary"
                htmlType="submit"
                className="my-1"
              >
                Save Changes
              </Button>
            </Col>
          </Col>
        </Row>
      </Form>
    </>
  );
};

export default VariantGroupDetail;
