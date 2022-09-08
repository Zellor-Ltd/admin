/* eslint-disable react-hooks/exhaustive-deps */
import { Button, Col, Form, Radio, Row } from 'antd';
import { categoryMapper } from 'helpers/categoryMapper';
import { AllCategories } from 'interfaces/Category';
import { Product } from 'interfaces/Product';
import { ProductBrand } from 'interfaces/ProductBrand';
import ProductCategoriesTrees from './ProductCategoriesTrees';
import { useCallback } from 'react';
import { categoryUtils } from '../../helpers/categoryUtils';
import SimpleSelect from 'components/select/SimpleSelect';
import { SelectOption } from 'interfaces/SelectOption';

const { categoriesKeys, categoriesFields } = categoryMapper;
const { getSearchTags, getCategories, removeSearchTagsByCategory } =
  categoryUtils;

interface ProductExpandedRowProps {
  record: Product;
  allCategories: AllCategories;
  onSaveProduct?: Function;
  loading: boolean;
  isStaging: boolean;
  productBrands: ProductBrand[];
}

const ProductExpandedRow: React.FC<ProductExpandedRowProps> = ({
  record,
  allCategories,
  onSaveProduct,
  loading,
  isStaging,
  productBrands,
}) => {
  const [form] = Form.useForm();

  const optionMapping: SelectOption = {
    key: 'id',
    label: 'brandName',
    value: 'id',
  };

  const onFinish = async () => {
    const _categories = [...form.getFieldValue('categories')];
    categoriesFields.forEach((field, index) => {
      _categories.forEach((productCategory: any) => {
        productCategory[field] = allCategories[
          categoriesKeys[index] as keyof AllCategories
        ].find(category => category.id === productCategory[field]?.id);
      });
    });

    const searchTags = form.getFieldValue('searchTags');
    const productBrand = form.getFieldValue('productBrand');

    await onSaveProduct?.({
      ...record,
      categories: _categories,
      searchTags: searchTags,
      productBrand: productBrand,
    });
  };

  const setSearchTagsByCategory = useCallback(
    (
      selectedCategories: any[] = [],
      categoryKey?: string,
      productCategoryIndex?: number
    ) => {
      const currentCategories = getCategories(form, allCategories);
      let previousTags: string[] = [];

      if (
        productCategoryIndex !== undefined &&
        categoryKey !== undefined &&
        record &&
        record?.categories
      ) {
        previousTags = getSearchTags(
          record.categories[productCategoryIndex],
          categoryKey
        );
      }

      const selectedCategoriesSearchTags = selectedCategories
        .filter(v => v && v.searchTags)
        .map(v => v.searchTags)
        .reduce((prev, curr) => {
          return prev?.concat(curr || []);
        }, []);

      let searchTags = form.getFieldValue('searchTags') || [];
      const finalValue = Array.from(
        new Set([
          ...searchTags.filter(tag => previousTags.indexOf(tag) === -1),
          ...selectedCategoriesSearchTags,
        ])
      );
      searchTags = finalValue;

      if (
        !!selectedCategories &&
        !!record &&
        !!record.categories &&
        productCategoryIndex !== undefined
      ) {
        record.categories[productCategoryIndex] = currentCategories;
      }

      form.setFieldsValue({
        searchTags,
      });
    },
    [form]
  );

  const handleCategoryDelete = (productCategoryIndex: number) => {
    removeSearchTagsByCategory(productCategoryIndex, record, form);
  };

  const handleCategoryChange = (
    selectedCategories: any,
    _productCategoryIndex: number,
    filterCategory: Function,
    categoryKey: string
  ) => {
    filterCategory(form);
    setSearchTagsByCategory(
      selectedCategories,
      categoryKey,
      _productCategoryIndex
    );
  };

  const updateForm = (
    _: string,
    entity: any,
    type: 'brand' | 'productBrand'
  ) => {
    if (type === 'brand') {
      form.setFieldsValue({ brand: entity });
    } else {
      form.setFieldsValue({ productBrand: entity });
    }
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
            <SimpleSelect
              data={productBrands}
              onChange={(value, brand) =>
                updateForm(value, brand, 'productBrand')
              }
              style={{ width: '100%' }}
              selectedOption={
                typeof record.productBrand === 'string'
                  ? record.productBrand
                  : record.productBrand?.brandName
              }
              optionMapping={optionMapping}
              placeholder={'Select a brand'}
              loading={false}
              disabled={false}
              allowClear
            ></SimpleSelect>
          </Form.Item>
        </Col>
      </Row>
      <ProductCategoriesTrees
        categories={record.categories}
        allCategories={allCategories}
        form={form}
        handleCategoryChange={handleCategoryChange}
        handleCategoryDelete={handleCategoryDelete}
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
