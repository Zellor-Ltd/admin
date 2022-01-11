import { Button, Col, Form, Input, PageHeader, Row, Select } from 'antd';
import { Upload } from 'components';
import { categoriesSettings } from 'helpers/utils';
import useAllCategories from 'hooks/useAllCategories';
import { useRequest } from 'hooks/useRequest';
import {
  AllCategories,
  AllCategoriesAPI,
  ProductCategory,
} from 'interfaces/Category';
import { SearchTag } from 'interfaces/SearchTag';
import React, { useEffect, useState } from 'react';
import { productCategoriesAPI } from 'services/DiscoClubService';
import SearchTags from './SearchTags';
interface CategoryDetailProps {
  search?: any;
  category: any;
  setDetails: any;
}

const { categoriesKeys, categoriesArray, categoriesFields } =
  categoriesSettings;

const CategoryDetail: React.FC<CategoryDetailProps> = ({
  search,
  category,
  setDetails,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const { doRequest } = useRequest({ setLoading });

  const categoryLevel = search;
  const categoryUpdateName = categoriesKeys[categoryLevel];
  const categoryField = categoriesFields[categoryLevel];

  const { fetchAllCategories, filteredCategories, filterCategory } =
    useAllCategories({
      setLoading,
      initialValues: category
        ? {
            superCategory: category.superCategory,
            category: category.category,
            subCategory: category.subCategory,
            subSubCategory: category.subSubCategory,
          }
        : undefined,
    });

  const [form] = Form.useForm();

  useEffect(() => {
    fetchAllCategories();
  }, [fetchAllCategories]);

  const convertTagsIntoStrings = (searchTag: SearchTag): string => {
    return `${searchTag.name}:${searchTag.value}`;
  };

  const onFinish = async () => {
    const category = {
      ...form.getFieldsValue(true),
      searchTags: form
        .getFieldValue('searchTags')
        .map(convertTagsIntoStrings)
        .filter((str: string) => str.length > 1),
    };
    await doRequest(() =>
      productCategoriesAPI[categoryField as keyof AllCategoriesAPI].save(
        category
      )
    );
    setDetails(false);
  };

  return (
    <>
      <PageHeader
        title={
          category
            ? `${category[categoryField]} ${categoryUpdateName} Update`
            : 'New item'
        }
        subTitle="Category"
      />
      <Form
        name="categoryForm"
        layout="vertical"
        form={form}
        onFinish={onFinish}
        initialValues={category}
      >
        <Row gutter={8}>
          <Col lg={12} xs={24}>
            {categoriesArray
              .filter((_, index) => index < categoryLevel + 1)
              .map(({ key, field }, _index) => (
                <Form.Item
                  label={key}
                  name={field}
                  rules={[{ required: true }]}
                >
                  {_index < categoryLevel ? (
                    <Select
                      disabled={
                        !filteredCategories[key as keyof AllCategories].length
                      }
                      // allowClear={true}
                      placeholder="Please select a category"
                      onChange={(_, option: any) =>
                        filterCategory(
                          option?.children as string,
                          key,
                          _field => {
                            if (
                              categoriesFields.indexOf(_field) < categoryLevel
                            )
                              form.setFieldsValue({ [_field]: '' });
                          }
                        )
                      }
                    >
                      {(
                        filteredCategories[
                          key as keyof AllCategories
                        ] as unknown as ProductCategory[]
                      ).map(category => (
                        <Select.Option
                          key={category.id}
                          value={
                            category[field as keyof ProductCategory] as string
                          }
                        >
                          {category[field as keyof ProductCategory]}
                        </Select.Option>
                      ))}
                    </Select>
                  ) : (
                    <Input></Input>
                  )}
                </Form.Item>
              ))}
            <SearchTags form={form} tagsAsStrings={category?.searchTags} />
          </Col>
          <Col lg={12} xs={24}>
            <Form.Item label="Image">
              <Upload.ImageUpload
                maxCount={1}
                fileList={category?.image}
                form={form}
                formProp="image"
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={8}>
          <Col>
            <Button type="default" onClick={() => setDetails(false)}>
              Cancel
            </Button>
          </Col>
          <Col>
            <Button loading={loading} type="primary" htmlType="submit">
              Save Changes
            </Button>
          </Col>
        </Row>
      </Form>
    </>
  );
};

export default CategoryDetail;
