import { Form, Select } from "antd";
import { FormInstance } from "antd/lib/form";
import { categoriesSettings } from "helpers/utils";
import useAllCategories from "hooks/useAllCategories";
import {
  AllCategories,
  ProductCategory,
  SelectedProductCategories,
} from "interfaces/Category";

const { categoriesArray } = categoriesSettings;

interface ProductCategoriesProps {
  allCategories: AllCategories;
  productCategoryIndex: number;
  selectedProductCategories: SelectedProductCategories[];
  handleCategoryChange: Function;
}

const ProductCategories: React.FC<ProductCategoriesProps> = ({
  allCategories,
  productCategoryIndex,
  selectedProductCategories,
  handleCategoryChange,
}) => {
  const { filteredCategories, filterCategory } = useAllCategories(
    undefined,
    undefined,
    selectedProductCategories[productCategoryIndex],
    allCategories
  );

  const _handleCategoryChange = (value: string, key: string) => {
    const selectedCategories = categoriesArray
      .map(({ key, field }) => {
        const selectedCategoryName = value;
        return filteredCategories[key as keyof AllCategories].find(
          (category) =>
            category[field as keyof ProductCategory] === selectedCategoryName
        );
      })
      .filter((v) => v);

    handleCategoryChange(
      selectedCategories,
      productCategoryIndex,
      (form: FormInstance) => {
        filterCategory(value, key, (_field) => {
          const formCategories = form.getFieldValue("categories");
          formCategories[productCategoryIndex][_field] = undefined;
          form.setFieldsValue({ categories: formCategories });
        });
      }
    );
  };

  return (
    <>
      {categoriesArray.map(({ key, field }, _index) => (
        <Form.Item
          label={key}
          name={["categories", productCategoryIndex, field, "id"]}
          rules={[{ required: _index < 2, message: `${key} is required` }]}
        >
          <Select
            disabled={!filteredCategories[key as keyof AllCategories].length}
            allowClear={_index >= 2}
            placeholder="Please select a category"
            style={{ width: "180px" }}
            onChange={(_, option: any) =>
              _handleCategoryChange(option?.children as string, key)
            }
          >
            {(
              filteredCategories[
                key as keyof AllCategories
              ] as unknown as ProductCategory[]
            ).map((category) => (
              <Select.Option key={category.id} value={category.id}>
                {category[field as keyof ProductCategory]}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      ))}
    </>
  );
};

export default ProductCategories;
