import { MinusOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Col, Form, Row } from "antd";
import { categoriesSettings } from "helpers/utils";
import { AllCategories, SelectedProductCategories } from "interfaces/Category";
import { Product } from "interfaces/Product";
import { useEffect, useState } from "react";
import ProductCategories from "./ProductCategories";
import ProductCategoriesTrees from "./ProductCategoriesTrees";
const { categoriesKeys, categoriesFields } = categoriesSettings;

interface ProductExpandedRowProps {
  record: Product;
  allCategories: AllCategories;
  onSaveProduct: Function;
  loading: boolean;
}

const ProductExpandedRow: React.FC<ProductExpandedRowProps> = ({
  record,
  allCategories,
  onSaveProduct,
  loading,
}) => {
  const [form] = Form.useForm();

  const onFinish = async () => {
    const _categories = [...form.getFieldValue("categories")];
    categoriesFields.forEach((field, index) => {
      _categories.forEach((productCategory: any) => {
        productCategory[field] = allCategories[
          categoriesKeys[index] as keyof AllCategories
        ].find((category) => category.id === productCategory[field]?.id);
      });
    });
    await onSaveProduct({ ...record, categories: _categories });
  };

  return (
    <Form layout="vertical" initialValues={record} form={form}>
      <ProductCategoriesTrees
        record={record}
        allCategories={allCategories}
        form={form}
      />
      <Col lg={24} xs={12}>
        <Button type="primary" onClick={onFinish} loading={loading}>
          Save
        </Button>
      </Col>
    </Form>
  );
};

export default ProductExpandedRow;
