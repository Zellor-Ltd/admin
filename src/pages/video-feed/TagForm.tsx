import React, { useState } from 'react';

import {
  AutoComplete,
  Button,
  Col,
  Form,
  InputNumber,
  Row,
  Select,
} from 'antd';
import { Brand } from 'interfaces/Brand';
import { Tag } from 'interfaces/Tag';
import { fetchTags, setPreserveDdTags } from '../../services/DiscoClubService';
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
  const [selectedTag, setSelectedTag] = useState<string>(tag?.tagName || '');
  const [form] = Form.useForm();
  const [tags, setTags] = useState<any[]>([]);
  const [filteredTags, setFilteredTags] = useState<any[]>([]);

  const tagOptionsMapping: SelectOption = {
    label: 'tagName',
    value: 'tagName',
    key: 'id',
  };

  const optionFactory = (option: any) => {
    return {
      label: option[tagOptionsMapping.label],
      value: option[tagOptionsMapping.value],
      key: option[tagOptionsMapping.value],
    };
  };

  const getTags = async (query: string) => {
    const response: any = await fetchTags({
      query,
      brandId: selectedBrandId,
      limit: 500,
    });

    setTags(response.results);
    setFilteredTags(response.results.map(optionFactory));
  };

  const onChangeTag = (key: string, selectedTag: any) => {
    setSelectedTag(selectedTag.label);
    if (selectedTag) {
      const _selectedTag = tags.find(tag => tag.tagName === selectedTag.label);
      _selectedTag.position = _selectedTag.position?.map(position => {
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
      form.setFieldsValue({ ..._selectedTag });
      return;
    }
    form.setFieldsValue({ ...(selectedTag as any) });
  };

  const handleBrandFilter = async (value: any) => {
    setSelectedBrandId(value);
    if (value) {
      const selectedBrand = brands.find(brand => brand.id === value);
      form.setFieldsValue({ id: '', brand: selectedBrand });
    }
    form.setFieldsValue({ tagName: '' });
  };

  const onSearchTag = (input: string) => {
    const mappedTags = tags.map(optionFactory);
    setFilteredTags(
      mappedTags.filter(tag =>
        tag.label.toLowerCase().includes(input.toLowerCase())
      )
    );
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
            <AutoComplete
              onFocus={() => getTags('')}
              style={{ width: '100%' }}
              options={filteredTags}
              onSelect={(_, tag) => onChangeTag(_, tag)}
              onSearch={onSearchTag}
              placeholder="Type to search a Tag"
              disabled={!selectedBrandId}
              value={selectedTag}
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
