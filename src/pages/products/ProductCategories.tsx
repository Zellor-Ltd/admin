import { Form } from "antd";
import { categoriesSettings } from "helpers/utils";
import { SelectCategorySmartSearch } from "components/SelectCategorySmartSearch";
import React, { useEffect, useState } from "react";
import {
  AllCategories,
  ProductCategory,
  SelectedCategories,
  SelectedProductCategories,
} from "interfaces/Category";
import useAllCategories from "hooks/useAllCategories";
import { FormInstance } from "antd/lib/form";

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
  const [selectedCategoryName, setSelectedCategoryName] = useState<string>("");
  const { filteredCategories, filterCategory } = useAllCategories({
    initialValues: formatProductCategories(initialValues[productCategoryIndex]),
    allCategories,
  });

  const _handleCategoryChange = (value: string, key: string) => {
    const selectedCategories = categoriesArray
      .map(({ key, field }) => {
        setSelectedCategoryName(value);
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
          key={_index}
          label={key}
          name={["categories", productCategoryIndex, field, "id"]}
          rules={[{ required: _index < 2, message: `${key} is required` }]}
        >
          <SelectCategorySmartSearch
            onChange={(_: any, option: any) =>
              _handleCategoryChange(option?.children as string, key)
            }
            allCategories={allCategories}
            productCategoryIndex={productCategoryIndex}
            initialValues={initialValues}
            value={selectedCategoryName}
            _handleCategoryChange={_handleCategoryChange}
            allowClear={_index >= 2}
            style={{ width: "180px" }}
            key={key}
            _index={_index}
            field={field}
          ></SelectCategorySmartSearch>
        </Form.Item>
      ))}
    </>
  );
};

export default ProductCategories;
