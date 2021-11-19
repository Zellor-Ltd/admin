import { Form } from "antd";
import { categoriesSettings } from "helpers/utils";
import useAllCategories from "hooks/useAllCategories";
import {
  AllCategories,
  SelectedCategories,
  SelectedProductCategories,
} from "interfaces/Category";
import { SelectCategorySmartSearch } from "components/SelectCategorySmartSearch";

const { categoriesArray } = categoriesSettings;

interface ProductCategoriesProps {
  allCategories: AllCategories;
  productCategoryIndex: number;
  initialValues: SelectedProductCategories[];
  handleCategoryChange: Function;
}

const formatProductCategories: (
  initialProductCategories: SelectedProductCategories
) => SelectedCategories = (initialProductCategories) => {
  const initialCategories: SelectedCategories = {
    superCategory: "",
  };
  Object.keys(initialProductCategories).forEach((key) => {
    const _key = key as keyof SelectedCategories;
    if (initialProductCategories[_key]) {
      initialCategories[_key] = initialProductCategories[_key]![_key];
    } else {
      delete initialCategories[_key];
    }
  });
  return initialCategories;
};

const ProductCategories: React.FC<ProductCategoriesProps> = ({
  allCategories,
  productCategoryIndex,
  initialValues,
  handleCategoryChange,
}) => {
  const { filteredCategories } = useAllCategories({
    initialValues: formatProductCategories(initialValues[productCategoryIndex]),
    allCategories,
  });

  return (
    <>
      {categoriesArray.map(({ key, field }, _index) => (
        <Form.Item
          key={_index}
          label={key}
          name={["categories", productCategoryIndex, field, "id"]}
          rules={[{ required: _index < 2, message: `${key} is required` }]}
        >
          <SelectCategorySmartSearch
            allCategories={allCategories}
            productCategoryIndex={productCategoryIndex}
            initialValues={initialValues}
            handleCategoryChange={handleCategoryChange}
            allowClear={_index >= 2}
            style={{ width: "180px" }}
            key={key}
            index={_index}
            field={field}
          ></SelectCategorySmartSearch>
        </Form.Item>
      ))}
    </>
  );
};

export default ProductCategories;
