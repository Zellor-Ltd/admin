import React, { useEffect } from 'react';
import { Form, Input, Button, Row, Col, FormInstance } from 'antd';
import { MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { SearchTag } from 'interfaces/SearchTag';

const searchTagFactory = (tagAsString?: string): SearchTag => ({
  name: tagAsString ? tagAsString.split(':')[0] : '',
  value: tagAsString ? tagAsString.split(':')[1] : '',
});

const SearchTags = ({
  form,
  tagsAsStrings = [],
}: {
  form: FormInstance<any>;
  tagsAsStrings?: string[];
}) => {
  useEffect(() => {
    const searchTags = tagsAsStrings.length
      ? tagsAsStrings.map(searchTagFactory)
      : [searchTagFactory()];
    form.setFieldsValue({ searchTags });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const add = () => {
    form.setFieldsValue({
      searchTags: [...form.getFieldValue('searchTags'), searchTagFactory()],
    });
  };

  const del = (index: number) => {
    form.setFieldsValue({
      searchTags: [
        ...form.getFieldValue('searchTags').slice(0, index),
        ...form.getFieldValue('searchTags').slice(index + 1),
      ],
    });
  };

  return (
    <Form.Item
      shouldUpdate={(prevValues, curValues) =>
        prevValues.searchTags !== curValues.searchTags
      }
    >
      {({ getFieldValue }) =>
        getFieldValue('searchTags')?.map((_: SearchTag, index: number) => (
          <Row gutter={8} key={index}>
            <Col xs={10}>
              <Form.Item label="Tag Name" name={['searchTags', index, 'name']}>
                <Input allowClear placeholder="Tag Name" />
              </Form.Item>
            </Col>
            <Col xs={10}>
              <Form.Item
                label="Tag Value"
                name={['searchTags', index, 'value']}
              >
                <Input allowClear placeholder="Tag Value" />
              </Form.Item>
            </Col>
            <Col xs={4} style={{ marginTop: '24px' }}>
              {index === form.getFieldValue('searchTags').length - 1 ? (
                <Button
                  onClick={add}
                  type="link"
                  style={{ padding: 0, margin: 6 }}
                >
                  <PlusOutlined />
                </Button>
              ) : (
                <Button
                  onClick={() => del(index)}
                  type="link"
                  style={{ padding: 0, margin: 6 }}
                >
                  <MinusOutlined />
                </Button>
              )}
            </Col>
          </Row>
        ))
      }
    </Form.Item>
  );
};
export default SearchTags;
