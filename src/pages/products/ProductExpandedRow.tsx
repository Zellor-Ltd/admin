import { Button, Col, Form, Radio } from "antd";
import { categoriesSettings } from "helpers/utils";
import { AllCategories } from "interfaces/Category";
import { Product } from "interfaces/Product";
import { useLocation } from "react-router-dom";
import ProductCategoriesTrees from "./ProductCategoriesTrees";
import { useCallback } from "react";
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
    console.log(record);
    await onSaveProduct({ ...record, categories: _categories });
  };

  const setSearchTagsByCategory = useCallback(
    (selectedCategories: any[] = []) => {
      const selectedCategoriesSearchTags = selectedCategories
        .filter((v) => v && v.searchTags)
        .map((v) => v.searchTags)
        .reduce((prev, curr) => {
          return prev?.concat(curr || []);
        }, []);

      let searchTags = form.getFieldValue("searchTags") || [];
      const finalValue = Array.from(
        new Set([...searchTags, ...selectedCategoriesSearchTags])
      );
      searchTags = finalValue;

      form.setFieldsValue({
        searchTags,
      });
    },
    [form]
  );

  const handleCategoryChange = (
    selectedCategories: any,
    _productCategoryIndex: number,
    filterCategory: Function
  ) => {
    filterCategory(form);
    setSearchTagsByCategory(selectedCategories);
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
