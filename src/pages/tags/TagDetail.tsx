/* eslint-disable react-hooks/exhaustive-deps */
import {
  Button,
  Col,
  Form,
  Input,
  InputNumber,
  message,
  PageHeader,
  Row,
  Select,
  Slider,
} from 'antd';
import { useRequest } from 'hooks/useRequest';
import { Brand } from 'interfaces/Brand';
import { Product } from 'interfaces/Product';
import { Tag } from 'interfaces/Tag';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { fetchBrands, fetchProducts, saveTag } from 'services/DiscoClubService';
import scrollIntoView from 'scroll-into-view';
interface TagDetailProps {
  tag?: Tag;
  onSave?: (record: Tag) => void;
  onCancel?: () => void;
}

const TagDetail: React.FC<TagDetailProps> = ({ tag, onSave, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const { doRequest } = useRequest({ setLoading });

  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string>(
    tag?.brand?.id || ''
  );
  const [form] = Form.useForm();
  const [productOptions, setProductOptions] = useState<Product[]>([]);

  const {
    settings: { template = [], clickSound = [] },
  } = useSelector((state: any) => state.settings);

  async function getProducts(mounted: boolean, _id?: string) {
    const response: any = await fetchProducts({
      brandId: _id ?? undefined,
    });
    if (mounted) {
      setProducts(response.results);
      setLoading(false);
    }
  }

  useEffect(() => {
    getProducts(true, selectedBrand);
    setProductOptions(productsBySelectedBrand());
  }, [selectedBrand]);

  useEffect(() => {
    let mounted = true;

    form.setFieldsValue({
      position: [
        {
          x: tag?.position?.[0]?.x || 50,
          y: tag?.position?.[0]?.y || 50,
        },
      ],
    });

    async function getBrands() {
      const response: any = await fetchBrands();
      if (mounted) {
        setBrands(response.results);
        setLoading(false);
      }
    }
    setLoading(true);
    getProducts(true);
    getBrands();
    return () => {
      mounted = false;
    };
  }, [tag, form]);

  const onFinish = async () => {
    setLoading(true);
    try {
      const tagForm = form.getFieldsValue(true);
      tagForm.product = products.find(
        product => product.id === tagForm.product?.id
      );
      tagForm.brand = brands.find(brand => brand.id === tagForm.brand?.id);
      const { result } = await doRequest(() => saveTag(tagForm));
      setLoading(false);
      message.success('Register updated with success.');
      tagForm.id ? onSave?.(tagForm) : onSave?.({ ...tagForm, id: result });
    } catch (error: any) {
      message.error('Error: ' + error.error);
    }
  };

  const handleFinishFailed = (errorFields: any[]) => {
    setLoading(false);
    message.error('Error: ' + errorFields[0].errors[0]);

    const id = errorFields[0].name[0];
    const element = document.getElementById(id);
    scrollIntoView(element);
  };

  const productsBySelectedBrand = () => {
    return products.filter(product => product.brand?.id === selectedBrand);
  };

  const onChangeBrand = (brandKey: string) => {
    setSelectedBrand(brandKey);
    form.setFieldsValue({ product: {} });
  };

  const onChangeTemplate = () => {
    form.setFieldsValue({ product: {} });
  };

  const filterOption = (input: string, option: any) => {
    return option?.label?.toUpperCase().includes(input?.toUpperCase());
  };

  return (
    <>
      <PageHeader title={tag ? `${tag?.tagName ?? ''} Update` : 'New Tag'} />
      <Form
        name="tagForm"
        layout="vertical"
        form={form}
        initialValues={tag}
        onFinish={onFinish}
        onFinishFailed={({ errorFields }) => handleFinishFailed(errorFields)}
        className="tags"
      >
        <Input.Group>
          <Row gutter={8}>
            <Col lg={12} xs={24}>
              <Form.Item
                name="tagName"
                label="Tag Name"
                rules={[{ required: true, message: 'Tag Name is required.' }]}
              >
                <Input allowClear id="tagName" placeholder="Tag Name" />
              </Form.Item>
            </Col>
            <Col lg={12} xs={24}>
              <Form.Item name={['brand', 'id']} label="Client">
                <Select
                  onChange={onChangeBrand}
                  placeholder="Client"
                  allowClear
                  showSearch
                  filterOption={filterOption}
                >
                  {brands.map(brand => (
                    <Select.Option
                      key={brand.id}
                      value={brand.id}
                      label={brand.brandName}
                    >
                      {brand.brandName}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col lg={12} xs={24}>
              <Form.Item
                name="template"
                label="Template"
                rules={[{ required: true, message: 'Template is required.' }]}
              >
                <Select
                  id="template"
                  placeholder="Please select a template"
                  onChange={onChangeTemplate}
                  allowClear
                  showSearch
                  filterOption={filterOption}
                >
                  {template.map((temp: any) => (
                    <Select.Option
                      key={temp.value}
                      value={temp.value}
                      label={temp.name}
                    >
                      {temp.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col lg={12} xs={24}>
              <Form.Item shouldUpdate>
                {() => (
                  <Form.Item name={['product', 'id']} label="Product">
                    <Select
                      disabled={
                        form.getFieldValue('template') === 'dollar' ||
                        !form.getFieldValue('brand')
                      }
                      placeholder="Product"
                      allowClear
                      showSearch
                      filterOption={filterOption}
                    >
                      {productOptions.map(product => (
                        <Select.Option
                          key={product.id}
                          value={product.id}
                          label={product.name}
                        >
                          {product.name}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                )}
              </Form.Item>
            </Col>
            <Col span={24}>
              <Row gutter={8}>
                <Col lg={6} xs={24}>
                  <Form.Item
                    name="discoGold"
                    label="Disco Gold"
                    rules={[
                      { required: true, message: 'Disco Gold is required.' },
                    ]}
                  >
                    <InputNumber
                      id="discoGold"
                      style={{ width: '100%' }}
                      placeholder="Disco Gold"
                    />
                  </Form.Item>
                </Col>
                <Col lg={6} xs={24}>
                  <Form.Item name="discoDollars" label="Disco Dollar">
                    <InputNumber
                      style={{ width: '100%' }}
                      placeholder="Disco Dollar"
                    />
                  </Form.Item>
                </Col>
                <Col lg={6} xs={24}>
                  <Form.Item
                    name="clickSound"
                    label="Click Sound"
                    rules={[
                      { required: true, message: 'Click Sound is required.' },
                    ]}
                  >
                    <Select
                      id="clickSound"
                      placeholder="Please select a click sound"
                      allowClear
                      showSearch
                      filterOption={filterOption}
                    >
                      {clickSound.map((click: any) => (
                        <Select.Option
                          key={click.value}
                          value={click.value}
                          label={click.name}
                        >
                          {click.name}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={8}>
                <Col lg={6} xs={24}>
                  <Form.Item
                    name={['position', 0, 'x']}
                    label="Disco Dollar Position X"
                  >
                    <Slider tipFormatter={v => `${v}%`} min={0} max={100} />
                  </Form.Item>
                </Col>
                <Col lg={6} xs={24}>
                  <Form.Item
                    name={['position', 0, 'y']}
                    label="Disco Dollar Position Y"
                  >
                    <Slider tipFormatter={v => `${v}%`} min={0} max={100} />
                  </Form.Item>
                </Col>
              </Row>
            </Col>
          </Row>
        </Input.Group>
        <Input.Group>
          <Row gutter={8}></Row>
        </Input.Group>
        <Row gutter={8} justify="end">
          <Col>
            <Button type="default" onClick={() => onCancel?.()}>
              Cancel
            </Button>
          </Col>
          <Col>
            <Col>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="mb-1"
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

export default TagDetail;
