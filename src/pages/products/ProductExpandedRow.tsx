import { Button, Col, Form, Radio } from "antd";
import { categoriesSettings } from "helpers/utils";
import { AllCategories } from "interfaces/Category";
import { Product } from "interfaces/Product";
import { useLocation } from "react-router-dom";
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

  const { pathname } = useLocation();
  const isStaging = pathname === "/staging-list";

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
    _: any,
    __: number,
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
      <Col lg={20} xs={24}>
        <Form.Item name="status" label="Status">
          <Radio.Group buttonStyle="solid">
            <Radio.Button value="live">Live</Radio.Button>
            <Radio.Button value="paused">Paused</Radio.Button>
            <Radio.Button value="expired">Expired</Radio.Button>
            <Radio.Button value="pending">Pending</Radio.Button>
          </Radio.Group>
        </Form.Item>
      </Col>
      <ProductCategoriesTrees
        categories={record.categories}
        allCategories={allCategories}
        form={form}
        handleCategoryChange={handleCategoryChange}
      />
      <Col lg={24} xs={12}>
        <Button
          disabled={record.brand.automated === true && !isStaging}
          type="primary"
          onClick={onFinish}
          loading={loading}
        >
          Save
        </Button>
      </Col>
    </Form>
  );
};

export default ProductExpandedRow;
