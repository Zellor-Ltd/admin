import {Button, Col, Form, Radio, Select, Row} from "antd";
import {categoriesSettings} from "helpers/utils";
import {AllCategories} from "interfaces/Category";
import {Product} from "interfaces/Product";
import {ProductBrand} from "interfaces/ProductBrand";
import {useLocation} from "react-router-dom";
import ProductCategoriesTrees from "./ProductCategoriesTrees";
import {useCallback, useState, useEffect} from "react";
import {fetchProductBrands} from "services/DiscoClubService";
import {SelectProductBrand} from "components/SelectProductBrand";
import {productUtils} from "../../helpers/product-utils";

const {categoriesKeys, categoriesFields} = categoriesSettings;

interface ProductExpandedRowProps {
  record: Product;
  allCategories: AllCategories;
  onSaveProduct: Function;
  loading: boolean;
  isStaging: boolean;
}

const {getPreviousSearchTags, getCurrentCategories} = productUtils;

const ProductExpandedRow: React.FC<ProductExpandedRowProps> = ({
 record,
 allCategories,
 onSaveProduct,
 loading,
  isStaging,
}) => {
  const [form] = Form.useForm();
  const [productBrands, setProductBrands] = useState<ProductBrand[]>([]);

  const {pathname} = useLocation();

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
    (selectedCategories: any[] = [], categoryKey?: string, productCategoryIndex?: number) => {

      const currentCategories = getCurrentCategories(form, allCategories);
      let previousTags: string[] = [];

      if (productCategoryIndex !== undefined && categoryKey !== undefined && record && record?.categories) {
        previousTags = getPreviousSearchTags(productCategoryIndex, categoryKey, record.categories);
      }

      const selectedCategoriesSearchTags = selectedCategories
        .filter((v) => v && v.searchTags)
        .map((v) => v.searchTags)
        .reduce((prev, curr) => {
          return prev?.concat(curr || []);
        }, []);

      let searchTags = form.getFieldValue("searchTags") || [];
      const finalValue = Array.from(
        new Set([...searchTags.filter(tag => previousTags.indexOf(tag) === -1), ...selectedCategoriesSearchTags])
      );
      searchTags = finalValue;

      if (!!selectedCategories && !!record && !!record.categories && productCategoryIndex !== undefined) {
        record.categories[productCategoryIndex] = currentCategories
      }

      form.setFieldsValue({
        searchTags,
      });
    },
    [form]
  );

  const handleCategoryChange = (
    selectedCategories: any,
    _productCategoryIndex: number,
    filterCategory: Function,
    categoryKey: string
  ) => {
    filterCategory(form);
    setSearchTagsByCategory(selectedCategories, categoryKey, _productCategoryIndex);
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
              initialProductBrandName={record.productBrand ?? ""}
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
