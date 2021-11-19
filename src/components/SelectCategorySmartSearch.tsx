import Select from "antd/lib/select";
import useAllCategories from "../hooks/useAllCategories";
import React, { useEffect, useState } from "react";
import { categoriesSettings } from "../helpers/utils";
import { FormInstance } from "antd/lib/form";
import {
  AllCategories,
  ProductCategory,
  SelectedCategories,
  SelectedProductCategories,
} from "../interfaces/Category";

const { categoriesArray } = categoriesSettings;

interface SelectCategorySmartSearchProps {
  allCategories: AllCategories;
  productCategoryIndex: number;
  initialValues: SelectedProductCategories[];
  handleCategoryChange: Function;
  style;
  allowClear: boolean;
  key: string;
  index: number;
  field: any;
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

export const SelectCategorySmartSearch: React.FC<SelectCategorySmartSearchProps> =
  ({
    style,
    allowClear = true,
    allCategories,
    productCategoryIndex,
    initialValues,
    handleCategoryChange,
    key,
    index,
    field,
  }) => {
    const [selectedCategoryName, setSelectedCategoryName] =
      useState<string>("");
    const { filteredCategories, filterCategory } = useAllCategories({
      initialValues: formatProductCategories(
        initialValues[productCategoryIndex]
      ),
      allCategories,
    });

    useEffect(() => {
      console.log(filteredCategories);
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
      <div style={{ marginBottom: "16px" }}>
        <Select
          key={index}
          value={selectedCategoryName}
          onChange={(_: any, option: any) =>
            _handleCategoryChange(option?.children as string, key)
          }
          showSearch
          allowClear={allowClear}
          style={style}
          disabled={
            !filteredCategories[key as unknown as keyof AllCategories]?.length //aqui
          }
          placeholder="Please select a category"
          filterOption={true}
        >
          {(
            filteredCategories[
              key as unknown as keyof AllCategories
            ] as unknown as ProductCategory[]
          )?.map(
            (
              category //aqui
            ) => (
              <Select.Option key={category.id} value={category.id}>
                {category[field as keyof ProductCategory]}
              </Select.Option>
            )
          )}
        </Select>
      </div>
    );
  };
