import React, { useState } from 'react';

import { Button, Col, Form, InputNumber, Row, Select } from 'antd';
import { Brand } from 'interfaces/Brand';
import { Tag } from 'interfaces/Tag';
import { fetchTags } from '../../services/DiscoClubService';
import DebounceSelect from '../../components/select/DebounceSelect';
import { SelectOption } from '../../interfaces/SelectOption';

interface FormProps {
  brands: Brand[];
  tag: Tag | undefined;
  setShowTagForm: (value: boolean) => void;
}

const TagForm: React.FC<FormProps> = ({ tag, setShowTagForm, brands }) => {
  const [selectedBrandId, setSelectedBrandId] = useState<string>(
    tag?.brand?.id || ''
  );
  const [form] = Form.useForm();
  const tagOptionsMapping: SelectOption = {
    label: 'tagName',
    value: 'id',
    key: 'id',
  };

  const getTags = async (query: string) => {
    const response: any = await fetchTags({
      query,
      brandId: selectedBrandId,
      limit: 100,
    });
    return response.results;
  };

  const onChangeTag = (key: string, selectedTag: Tag) => {
    if (selectedTag) {
      selectedTag.position = selectedTag.position?.map(position => {
        return {
          x: position.x ?? form.getFieldValue(['position', 0, 'x']),
          y: position.y ?? form.getFieldValue(['position', 0, 'y']),
          z: position.z ?? form.getFieldValue(['position', 0, 'z']),
          opacity:
            position.opacity ?? form.getFieldValue(['position', 0, 'opacity']),
          startTime:
            position.startTime ??
            form.getFieldValue(['position', 0, 'startTime']),
        };
      });
    }

    form.setFieldsValue({ ...selectedTag });
  };

  const handleBrandFilter = (value: any) => {
    setSelectedBrandId(value);
    if (value) {
      form.setFieldsValue({ id: '' });
    }
  };

  return (
    <Form name="tagForm" form={form} initialValues={tag} layout="vertical">
      <Row gutter={8}>
        <Col lg={12} xs={24}>
          <Form.Item label="Brand" rules={[{ required: true }]}>
            <Select
              showSearch
              allowClear
              filterOption={(input, option) =>
                !!option?.children
                  ?.toString()
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              onChange={v => handleBrandFilter(v)}
              value={selectedBrandId}
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
          <Form.Item name={'tagName'} label="Tag" rules={[{ required: true }]}>
            <DebounceSelect
              fetchOptions={getTags}
              onChange={onChangeTag}
              optionsMapping={tagOptionsMapping}
              placeholder="Type to search a Tag"
              value={tag?.tagName}
              disabled={!selectedBrandId}
            />
          </Form.Item>
        </Col>
        <Col lg={3} xs={24}>
          <Form.Item
            name={['position', 0, 'startTime']}
            fieldKey={'startTime'}
            label="Start Time"
            rules={[{ required: true }]}
          >
            <InputNumber />
          </Form.Item>
        </Col>
        <Col lg={3} xs={24}>
          <Form.Item
            name={['position', 0, 'opacity']}
            fieldKey={'opacity'}
            label="Opacity"
            rules={[{ required: true }]}
            initialValue={1}
          >
            <InputNumber />
          </Form.Item>
        </Col>
        <Col lg={3} xs={24}>
          <Form.Item
            name={['position', 0, 'duration']}
            fieldKey={'duration'}
            label="duration"
            rules={[{ required: true }]}
          >
            <InputNumber />
          </Form.Item>
        </Col>
        <Col lg={3} xs={24}>
          <Form.Item
            name={['position', 0, 'x']}
            fieldKey={'x'}
            label="Position X"
            rules={[{ required: true }]}
            initialValue={0}
          >
            <InputNumber />
          </Form.Item>
        </Col>
        <Col lg={3} xs={24}>
          <Form.Item
            name={['position', 0, 'y']}
            fieldKey={'y'}
            label="Position Y"
            rules={[{ required: true }]}
            initialValue={0}
          >
            <InputNumber />
          </Form.Item>
        </Col>
        <Col lg={3} xs={24}>
          <Form.Item
            name={['position', 0, 'z']}
            fieldKey={'z'}
            label="Z Index"
            rules={[{ required: true }]}
            initialValue={1}
          >
            <InputNumber />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={8}>
        <Col>
          <Button onClick={() => setShowTagForm(false)}>Cancel</Button>
        </Col>
        <Col>
          <Button type="primary" htmlType="submit">
            Save Tag
          </Button>
        </Col>
      </Row>
    </Form>
  );
};

export default TagForm;
