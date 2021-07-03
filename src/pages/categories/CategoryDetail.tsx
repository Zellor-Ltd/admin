import {
  Button,
  Col,
  Form,
  Input,
  message,
  PageHeader,
  Row,
  Select,
} from "antd";
import { Upload } from "components";
import React, { useEffect, useState } from "react";
import { RouteComponentProps } from "react-router";
import { saveCategory } from "services/DiscoClubService";

import { SearchTag } from "interfaces/SearchTag";
import SearchTags from "./SearchTags";
import { categoriesSettings } from "helpers/utils";
import useFetchAllCategories from "hooks/useFetchAllCategories";
import { AllCategories, ProductCategory } from "interfaces/Category";

const { categoriesKeys, categoriesArray } = categoriesSettings;

const CategoryDetail: React.FC<RouteComponentProps> = (props) => {
  const { history, location } = props;
  const initial: any = location.state;
  const params = new URLSearchParams(location.search);

  const categoryLevel = Number(params.get("category-level"));
  const categoryUpdateName = categoriesKeys[categoryLevel];

  const [loading, setLoading] = useState<boolean>(false);
  const [fetchAllCategories, _, filteredCategories, filterCategory] =
    useFetchAllCategories(setLoading);

  const [form] = Form.useForm();

  useEffect(() => {
    fetchAllCategories();
  }, [fetchAllCategories]);

  const convertTagsIntoStrings = (searchTag: SearchTag): string => {
    return `${searchTag.name}:${searchTag.value}`;
  };

  const onFinish = async () => {
    const brand = {
      ...form.getFieldsValue(true),
      searchTags: form
        .getFieldValue("searchTags")
        .map(convertTagsIntoStrings)
        .filter((str: string) => str.length > 1),
    };
    setLoading(true);
    try {
      const response: any = await saveCategory(brand);
      if (response.success) {
        message.success("Register updated with success.");
        history.push("/categories");
      } else {
        message.error(response.error);
      }
    } catch (error) {
      message.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHeader title={`${categoryUpdateName} Update`} subTitle="Category" />
      <Form
        name="categoryForm"
        layout="vertical"
        form={form}
        onFinish={onFinish}
        initialValues={initial}
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
                      placeholder="Please select a category"
                      onChange={(value) => filterCategory(key, value, form)}
                    >
                      {(
                        filteredCategories[
                          key as keyof AllCategories
                        ] as unknown as ProductCategory[]
                      ).map((category: any) => (
                        <Select.Option key={category.id} value={category.name}>
                          {category.name}
                        </Select.Option>
                      ))}
                    </Select>
                  ) : (
                    <Input></Input>
                  )}
                </Form.Item>
              ))}
            <SearchTags form={form} tagsAsStrings={initial?.searchTags} />
          </Col>
          <Col lg={12} xs={24}>
            <Form.Item label="Image">
              <Upload.ImageUpload
                maxCount={1}
                fileList={initial?.image}
                form={form}
                formProp="image"
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={8}>
          <Col>
            <Button type="default" onClick={() => history.push("/categories")}>
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
