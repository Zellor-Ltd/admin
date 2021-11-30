import { Button, Col, Form, Radio, Select, Row } from "antd";
import { categoriesSettings } from "helpers/utils";
import { AllCategories } from "interfaces/Category";
import { Product } from "interfaces/Product";
import { ProductBrand } from "interfaces/ProductBrand";
import { useLocation } from "react-router-dom";
import ProductCategoriesTrees from "./ProductCategoriesTrees";
import { useCallback, useState, useEffect } from "react";
import { fetchProductBrands } from "services/DiscoClubService";
import { SelectProductBrand } from "components/SelectProductBrand";
const { categoriesKeys, categoriesFields } = categoriesSettings;

interface ProductExpandedRowProps {
  record: Product;
  allCategories: AllCategories;
  onSaveProduct: Function;
  loading: boolean;
  isStaging: boolean;
}

const ProductExpandedRow: React.FC<ProductExpandedRowProps> = ({
  record,
  allCategories,
  onSaveProduct,
  loading,
  isStaging,
}) => {
  const [form] = Form.useForm();
  const [productBrands, setProductBrands] = useState<ProductBrand[]>([]);

  const { pathname } = useLocation();

  useEffect(() => {
    const getProductBrands = async () => {
      const response: any = await fetchProductBrands();
      setProductBrands(response.results);
    };

    getProductBrands();
  }, []);

  const onFinish = async () => {
    const _categories = [...form.getFieldValue("categories")];
    categoriesFields.forEach((field, index) => {
      _categories.forEach((productCategory: any) => {
        productCategory[field] = allCategories[
          categoriesKeys[index] as keyof AllCategories
        ].find((category) => category.id === productCategory[field]?.id);
      });
    });

    const searchTags = form.getFieldValue("searchTags");
    const productBrand = form.getFieldValue("productBrand");

    await onSaveProduct({
      ...record,
      categories: _categories,
      searchTags: searchTags,
      productBrand: productBrand,
    });
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

  const handleProductBrandChange = (filterProductBrand: Function) => {
    filterProductBrand(form);
  };

  return (
    <Form
      layout="vertical"
      initialValues={record}
      onFinish={onFinish}
      form={form}
    >
      <Row gutter={8}>
        <Col lg={4} xs={8}>
          <Form.Item name="status" label="Status">
            <Radio.Group buttonStyle="solid">
              <Radio.Button value="live">Live</Radio.Button>
              <Radio.Button value="paused">Paused</Radio.Button>
            </Radio.Group>
          </Form.Item>
        </Col>
        <Col lg={4} xs={8}>
          <Form.Item name="productBrand" label="Product Brand">
            <SelectProductBrand
              allowClear={true}
              initialProductBrandName={""}
              handleProductBrandChange={handleProductBrandChange}
            ></SelectProductBrand>
          </Form.Item>
        </Col>
      </Row>
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
          htmlType="submit"
          loading={loading}
        >
          Save
        </Button>
      </Col>
    </Form>
  );
};

export default ProductExpandedRow;
