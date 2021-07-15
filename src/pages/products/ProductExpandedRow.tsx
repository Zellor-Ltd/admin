import { Button, Col, Form } from "antd";
import { categoriesSettings } from "helpers/utils";
import { AllCategories } from "interfaces/Category";
import { Product } from "interfaces/Product";
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

  const handleCategoryChange = (
    selectedCategories: any,
    productCategoryIndex: number,
    filterCategory: Function
  ) => {
    filterCategory(form);
  };

  return (
    <Form
      layout="vertical"
      initialValues={record}
      onFinish={onFinish}
      form={form}
    >
      <ProductCategoriesTrees
        categories={record.categories}
        allCategories={allCategories}
        form={form}
        handleCategoryChange={handleCategoryChange}
      />
      <Col lg={24} xs={12}>
        <Button type="primary" htmlType="submit" loading={loading}>
          Save
        </Button>
      </Col>
    </Form>
  );
};

export default ProductExpandedRow;
