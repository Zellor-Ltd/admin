import { MinusCircleOutlined } from '@ant-design/icons';
import { Segment } from 'interfaces/Segment';
import { Tag } from 'interfaces/Tag';
import { Button, Col, Form, InputNumber, Row, Select, Typography } from 'antd';
import { Brand } from 'interfaces/Brand';
import { Upload } from 'components';
import { useEffect, useState } from 'react';
import { fetchBrands, fetchTags } from 'services/DiscoClubService';

interface FormProps {
  segment: Segment | undefined;
  onCancel: () => void;
  onEditTag: (tag: Tag, index: number) => void;
  onEditBrand: (brand: Brand, index: number) => void;
  onAddBrand: () => void;
  onAddTag: () => void;
  formFn: any;
}

const SegmentForm: React.FC<FormProps> = ({ segment, onCancel, formFn }) => {
  const [form] = Form.useForm();
  formFn(form);
  const [tags, setTags] = useState<Tag[]>([]);
  const [filteredTags, setFilteredTags] = useState<Tag[][]>([]);
  const [selectedFilterBrands, setSelectedFilterBrands] = useState<string[]>(
    []
  );
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    form.resetFields();
    const selectedTags = form.getFieldValue('tags');
    setSelectedFilterBrands(prev => {
      selectedTags.forEach((tag: Tag, index: number) => {
        prev[index] = tag.brand?.id || '';
      });
      return [...prev];
    });
    setFilteredTags(prev => {
      selectedTags.forEach((tag: Tag, index: number) => {
        prev[index] = tags.filter(_tag => _tag.brand?.id === tag.brand?.id);
      });
      return [...prev];
    });
  }, [segment, form, tags]);

  useEffect(() => {
    let mounted = true;
    async function getTags() {
      const response: any = await fetchTags({});
      if (mounted) {
        setTags(response.results);
        setLoading(false);
      }
    }
    async function getBrands() {
      const response: any = await fetchBrands();
      if (mounted) {
        setBrands(response.results);
        setLoading(false);
      }
    }
    setLoading(true);
    getTags();
    getBrands();
    return () => {
      mounted = false;
    };
  }, []);

  const onChangeTag = (key: string, fieldName: number, index: number) => {
    const formTags = form.getFieldValue('tags');
    const selectedTag = tags.find((tag: Tag) => tag.id === key);
    formTags[fieldName] = { ...formTags[fieldName], ...selectedTag };

    setSelectedFilterBrands(prev => {
      prev[index] = selectedTag?.brand?.id || '';
      return prev;
    });
    form.setFieldsValue({ tags: formTags });
    form.setFields([{ name: 'tags', touched: true }]);
  };

  const onChangeBrand = (key: string, fieldName: number) => {
    const formBrands = form.getFieldValue('brands');
    const selectedBrand: any = brands.find((brand: Brand) => brand.id === key);

    const changedBrand = { ...selectedBrand };
    if (changedBrand.selectedLogo) {
      changedBrand.selectedLogoUrl =
        selectedBrand[changedBrand.selectedLogo].url;
    }
    formBrands[fieldName] = changedBrand;

    form.setFieldsValue({ brands: formBrands });
    form.setFields([{ name: 'brands', touched: true }]);
  };

  const onChangeLogo = (key: string, fieldName: number) => {
    const formBrands = form.getFieldValue('brands');
    const selectedBrand = formBrands[fieldName];

    formBrands[fieldName].selectedLogoUrl = selectedBrand[key].url;
    form.setFieldsValue({ brands: formBrands });
    form.setFields([{ name: 'brands', touched: true }]);
  };

  const handleBrandFilter = (value: any, index: number) => {
    setFilteredTags(prev => {
      if (value) {
        prev[index] = tags.filter(tag => tag.brand?.id === value);
      } else {
        prev[index] = tags;
      }
      return [...prev];
    });
    setSelectedFilterBrands(prev => {
      prev[index] = value;
      return [...prev];
    });
    if (value) {
      const formTags = form.getFieldValue('tags');
      formTags[index].id = '';
      form.setFieldsValue({ tags: formTags });
    }
  };

  const filterOption = (input: string, option: any) => {
    return option?.label?.toUpperCase().includes(input?.toUpperCase());
  };

  return (
    <Form
      form={form}
      initialValues={segment}
      name="segmentForm"
      layout="vertical"
    >
      <Row gutter={8}>
        <Col lg={4} xs={24}>
          <Form.Item
            name="sequence"
            label="Sequence"
            rules={[{ required: true }]}
          >
            <InputNumber />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={8}>
        <Col lg={6} xs={24}>
          <Col span={24}>
            <Form.Item label="Video">
              <Upload.VideoUpload
                fileList={segment?.video}
                formProp="video"
                form={form}
              />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item label="Thumbnail URL">
              <Upload.ImageUpload
                type="thumbnail"
                form={form}
                formProp="thumbnail"
                fileList={segment?.thumbnail}
              />
            </Form.Item>
          </Col>
        </Col>
        <Col lg={18} xs={24}>
          <Col span={24}>
            <Typography.Title level={4}>Clients</Typography.Title>
          </Col>
          <Col span={24}>
            <Form.List name="brands">
              {(fields, { add, remove }) => (
                <div>
                  <Row>
                    <Col
                      lg={4}
                      xs={24}
                      style={{ display: 'flex', alignItems: 'center' }}
                    >
                      <Button
                        onClick={() =>
                          add({
                            position: [
                              {
                                startTime: 1,
                                opacity: 1,
                                duration: 2,
                                x: 100,
                                y: 100,
                                z: 1,
                              },
                            ],
                          })
                        }
                      >
                        Add Client
                      </Button>
                    </Col>
                  </Row>
                  {fields.map(field => (
                    <Row gutter={8} key={Math.random()}>
                      <Col lg={4} xs={24}>
                        <Form.Item
                          name={[field.name, 'id']}
                          label="Client"
                          rules={[{ required: true }]}
                        >
                          <Select
                            allowClear
                            showSearch
                            filterOption={filterOption}
                            onChange={(key: string) =>
                              onChangeBrand(key, field.name)
                            }
                            loading={loading}
                          >
                            {brands.map(brand => (
                              <Select.Option key={brand.id} value={brand.id}>
                                {brand.brandName}
                              </Select.Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col lg={4} xs={24}>
                        <Form.Item
                          shouldUpdate={(prevValues, curValues) =>
                            prevValues.brands[field.name]?.id !==
                            curValues.brands[field.name]?.id
                          }
                        >
                          {({ getFieldValue }) => {
                            const bra = getFieldValue('brands')[field.name];
                            return (
                              <Form.Item
                                name={[field.name, 'selectedLogo']}
                                label="Client logo"
                              >
                                <Select
                                  placeholder="Please select a logo"
                                  onChange={(key: string) =>
                                    onChangeLogo(key, field.name)
                                  }
                                  filterOption={filterOption}
                                  allowClear
                                  showSearch
                                >
                                  {bra.brandLogo?.url && (
                                    <Select.Option value="brandLogo">
                                      Client
                                    </Select.Option>
                                  )}

                                  {bra.colourLogo?.url && (
                                    <Select.Option value="colourLogo">
                                      Colour
                                    </Select.Option>
                                  )}
                                  {bra.blackLogo?.url && (
                                    <Select.Option value="blackLogo">
                                      Black
                                    </Select.Option>
                                  )}
                                  {bra.whiteLogo?.url && (
                                    <Select.Option value="whiteLogo">
                                      White
                                    </Select.Option>
                                  )}
                                </Select>
                              </Form.Item>
                            );
                          }}
                        </Form.Item>
                      </Col>
                      <Col lg={4} xs={24}>
                        <Form.Item
                          name={[field.name, 'position', 0, 'startTime']}
                          fieldKey={[field.key, 'startTime']}
                          label="Start Time"
                          rules={[{ required: true }]}
                        >
                          <InputNumber />
                        </Form.Item>
                      </Col>
                      <Col lg={4} xs={24}>
                        <Form.Item
                          name={[field.name, 'position', 0, 'opacity']}
                          fieldKey={[field.key, 'opacity']}
                          label="Opacity"
                          rules={[{ required: true }]}
                        >
                          <InputNumber />
                        </Form.Item>
                      </Col>
                      <Col lg={4} xs={24}>
                        <Form.Item
                          name={[field.name, 'position', 0, 'duration']}
                          fieldKey={[field.key, 'duration']}
                          label="duration"
                          rules={[{ required: true }]}
                        >
                          <InputNumber />
                        </Form.Item>
                      </Col>
                      <Col lg={4} xs={24}>
                        <Form.Item
                          name={[field.name, 'position', 0, 'x']}
                          fieldKey={[field.key, 'x']}
                          label="Position X"
                          rules={[{ required: true }]}
                        >
                          <InputNumber />
                        </Form.Item>
                      </Col>
                      <Col lg={4} xs={24}>
                        <Form.Item
                          name={[field.name, 'position', 0, 'y']}
                          fieldKey={[field.key, 'y']}
                          label="position Y"
                          rules={[{ required: true }]}
                        >
                          <InputNumber />
                        </Form.Item>
                      </Col>
                      <Col lg={4} xs={24}>
                        <Form.Item
                          name={[field.name, 'position', 0, 'z']}
                          fieldKey={[field.key, 'z']}
                          label="Z Index"
                          rules={[{ required: true }]}
                        >
                          <InputNumber />
                        </Form.Item>
                      </Col>

                      <Col style={{ display: 'flex', alignItems: 'center' }}>
                        <MinusCircleOutlined
                          onClick={() => remove(field.name)}
                        />
                      </Col>
                    </Row>
                  ))}
                </div>
              )}
            </Form.List>
          </Col>
          <Col span={24}>
            <Typography.Title level={4}>Tags</Typography.Title>
          </Col>
          <Col span={24}>
            <Form.List name="tags">
              {(fields, { add, remove }) => (
                <div>
                  <Button
                    onClick={() =>
                      add({
                        position: [
                          {
                            startTime: 1,
                            opacity: 1,
                            duration: 2,
                            x: 100,
                            y: 100,
                            z: 1,
                          },
                        ],
                      })
                    }
                  >
                    Add Tag
                  </Button>
                  {fields.map((field, index) => (
                    <Row gutter={8} key={Math.random()}>
                      <Col lg={12} xs={24}>
                        <Form.Item label="Client">
                          <Select
                            showSearch
                            allowClear
                            filterOption={filterOption}
                            loading={loading}
                            onChange={v => handleBrandFilter(v, index)}
                            value={selectedFilterBrands[index]}
                          >
                            {brands.map(brand => (
                              <Select.Option key={brand.id} value={brand.id}>
                                {brand.brandName}
                              </Select.Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col lg={12} xs={24}>
                        <Form.Item
                          name={[field.name, 'id']}
                          label="Tag"
                          rules={[{ required: true }]}
                        >
                          <Select
                            onChange={(key: string) =>
                              onChangeTag(key, field.name, index)
                            }
                            loading={loading}
                            filterOption={filterOption}
                            allowClear
                            showSearch
                          >
                            {(filteredTags[index]
                              ? filteredTags[index]
                              : tags
                            ).map(tag => (
                              <Select.Option key={tag.id} value={tag.id}>
                                {tag.tagName}
                              </Select.Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col lg={3} xs={24}>
                        <Form.Item
                          name={[field.name, 'position', 0, 'startTime']}
                          fieldKey={[field.key, 'startTime']}
                          label="Start Time"
                          rules={[{ required: true }]}
                        >
                          <InputNumber />
                        </Form.Item>
                      </Col>
                      <Col lg={3} xs={24}>
                        <Form.Item
                          name={[field.name, 'position', 0, 'opacity']}
                          fieldKey={[field.key, 'opacity']}
                          label="Opacity"
                          rules={[{ required: true }]}
                        >
                          <InputNumber />
                        </Form.Item>
                      </Col>
                      <Col lg={3} xs={24}>
                        <Form.Item
                          name={[field.name, 'position', 0, 'duration']}
                          fieldKey={[field.key, 'duration']}
                          label="duration"
                          rules={[{ required: true }]}
                        >
                          <InputNumber />
                        </Form.Item>
                      </Col>
                      <Col lg={3} xs={24}>
                        <Form.Item
                          name={[field.name, 'position', 0, 'x']}
                          fieldKey={[field.key, 'x']}
                          label="Position X"
                          rules={[{ required: true }]}
                        >
                          <InputNumber />
                        </Form.Item>
                      </Col>
                      <Col lg={3} xs={24}>
                        <Form.Item
                          name={[field.name, 'position', 0, 'y']}
                          fieldKey={[field.key, 'y']}
                          label="Position Y"
                          rules={[{ required: true }]}
                        >
                          <InputNumber />
                        </Form.Item>
                      </Col>
                      <Col lg={3} xs={24}>
                        <Form.Item
                          name={[field.name, 'position', 0, 'z']}
                          fieldKey={[field.key, 'z']}
                          label="Z Index"
                          rules={[{ required: true }]}
                        >
                          <InputNumber />
                        </Form.Item>
                      </Col>
                      <Col style={{ display: 'flex', alignItems: 'center' }}>
                        <MinusCircleOutlined
                          onClick={() => remove(field.name)}
                        />
                      </Col>
                    </Row>
                  ))}
                </div>
              )}
            </Form.List>
          </Col>
        </Col>
      </Row>
      <Row gutter={8}>
        <Col>
          <Button onClick={onCancel}>Cancel</Button>
        </Col>
        <Col>
          <Button type="primary" htmlType="submit" loading={loading}>
            Save Segment
          </Button>
        </Col>
      </Row>
    </Form>
  );
};

export default SegmentForm;
