import React, { useState } from 'react';

import { Button, Col, Form, InputNumber, Row, Select } from 'antd';
import { Brand } from 'interfaces/Brand';
import { Tag } from 'interfaces/Tag';
import { fetchTags } from '../../services/DiscoClubService';
import { SelectOption } from '../../interfaces/SelectOption';
import MultipleFetchDebounceSelect from '../../components/select/MultipleFetchDebounceSelect';

interface FormProps {
  setTag: any;
  brands: Brand[];
  tag: Tag | undefined;
  setShowTagForm: (value: boolean) => void;
}

const TagForm: React.FC<FormProps> = ({
  setTag,
  tag,
  setShowTagForm,
  brands,
}) => {
  const [selectedBrandId, setSelectedBrandId] = useState<string | undefined>(
    tag?.brand?.id
  );
  const [form] = Form.useForm();
  const [tags, setTags] = useState<any[]>([]);
  const [userInput, setUserInput] = useState<string | undefined>(tag?.tagName);
  const [optionsPage, setOptionsPage] = useState<number>(0);

  const tagOptionMapping: SelectOption = {
    label: 'tagName',
    value: 'tagName',
    key: 'id',
  };

  const getTags = async (input?: string, loadNextPage?: boolean) => {
    setUserInput(input);
    const pageToUse = !!!loadNextPage ? 0 : optionsPage;
    const response: any = await fetchTags({
      page: pageToUse,
      query: input,
      brandId: selectedBrandId,
      limit: 30,
    });
    setOptionsPage(pageToUse + 1);

    if (pageToUse === 0) setTags(response.results);
    else setTags(prev => [...prev.concat(response.results)]);

    return response.results;
  };

  const onChangeTag = (value?: string, _selectedTag?: any) => {
    if (_selectedTag) {
      setUserInput(value);
      const position = _selectedTag.position?.map(position => {
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
      form.setFieldsValue({ position: position });
      setTag(_selectedTag);
    } else {
      setUserInput('');
      setTags([]);
      getTags();
    }
  };

  const handleBrandFilter = async (value: any) => {
    setSelectedBrandId(value);
    if (value) {
      const selectedBrand = brands.find(brand => brand.id === value);
      form.setFieldsValue({ brand: selectedBrand });
    }
    form.setFieldsValue({ tagName: '' });
  };

  const filterOption = (input: string, option: any) => {
    return !!option?.children
      ?.toString()
      ?.toUpperCase()
      .includes(input?.toUpperCase());
  };

  return (
    <Form name="tagForm" form={form} initialValues={tag} layout="vertical">
      <Row gutter={8}>
        <Col lg={12} xs={24}>
          <Form.Item label="Brand" rules={[{ required: true }]}>
            <Select
              showSearch
              allowClear
              placeholder="Please select a Brand"
              filterOption={filterOption}
              onChange={v => handleBrandFilter(v)}
              value={selectedBrandId}
              disabled={!brands}
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
          <Form.Item name="tagName" label="Tag" rules={[{ required: true }]}>
            <MultipleFetchDebounceSelect
              style={{ width: '100%' }}
              onInput={getTags}
              onChange={onChangeTag}
              onClear={onChangeTag}
              optionMapping={tagOptionMapping}
              placeholder="Type to search a Tag"
              disabled={!selectedBrandId || !brands}
              input={userInput}
              options={tags}
            ></MultipleFetchDebounceSelect>
          </Form.Item>
        </Col>
        <Col lg={4} xs={24}>
          <Form.Item
            name={['position', 0, 'startTime']}
            fieldKey="startTime"
            label="Start Time"
            rules={[{ required: true }]}
          >
            <InputNumber disabled={!brands} placeholder="Start Time" />
          </Form.Item>
        </Col>
        <Col lg={4} xs={24}>
          <Form.Item
            name={['position', 0, 'opacity']}
            fieldKey="opacity"
            label="Opacity"
            rules={[{ required: true }]}
            initialValue={1}
          >
            <InputNumber disabled={!brands} placeholder="Opacity" />
          </Form.Item>
        </Col>
        <Col lg={4} xs={24}>
          <Form.Item
            name={['position', 0, 'duration']}
            fieldKey="duration"
            label="Duration"
            rules={[{ required: true }]}
          >
            <InputNumber disabled={!brands} placeholder="Duration" />
          </Form.Item>
        </Col>
        <Col lg={4} xs={24}>
          <Form.Item
            name={['position', 0, 'x']}
            fieldKey="x"
            label="Position X"
            rules={[{ required: true }]}
            initialValue={0}
          >
            <InputNumber disabled={!brands} placeholder="Position X" />
          </Form.Item>
        </Col>
        <Col lg={4} xs={24}>
          <Form.Item
            name={['position', 0, 'y']}
            fieldKey="y"
            label="Position Y"
            rules={[{ required: true }]}
            initialValue={0}
          >
            <InputNumber disabled={!brands} placeholder="Position Y" />
          </Form.Item>
        </Col>
        <Col lg={4} xs={24}>
          <Form.Item
            name={['position', 0, 'z']}
            fieldKey="z"
            label="Z Index"
            rules={[{ required: true }]}
            initialValue={1}
          >
            <InputNumber disabled={!brands} placeholder="Z Index" />
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
