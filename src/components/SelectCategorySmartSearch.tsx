import Select from "antd/lib/select";
import useAllCategories from "../hooks/useAllCategories";
import React, { useEffect, useState } from "react";
import {
  AllCategories,
  ProductCategory,
  SelectedCategories,
  SelectedProductCategories,
} from "../interfaces/Category";

interface SelectCategorySmartSearchProps {
  allCategories: AllCategories;
  productCategoryIndex: number;
  initialValues: SelectedProductCategories[];
  _handleCategoryChange: Function;
  style;
  allowClear: boolean;
  key: string;
  _index: number;
  field: any;
  value: any;
  onChange: (_: any, option: any) => void;
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
    value,
    _index,
    field,
    onChange,
  }) => {
    const [selectedCategoryName, setSelectedCategoryName] =
      useState<string>("");
    const { filteredCategories, filterCategory } = useAllCategories({
      initialValues: formatProductCategories(
        initialValues[productCategoryIndex]
      ),
      allCategories,
    });
    const [disabled, setDisabled] = useState<boolean>(false);

    useEffect(() => {
      console.log(filteredCategories);
      console.log(filteredCategories["Category"]);
      if (
        (_index === 1 && !filteredCategories["Category"].length) ||
        (_index === 2 && !filteredCategories["Sub Category"].length) ||
        (_index === 3 && !filteredCategories["Sub Sub Category"].length)
      ) {
        setDisabled(true);
      }
      if (
        selectedCategoryName !== "" &&
        ((_index === 1 && !filteredCategories["Super Category"].length) ||
          (_index === 2 && !filteredCategories["Category"].length) ||
          (_index === 3 && !filteredCategories["Sub Category"].length))
      ) {
        setDisabled(false);
      }
    }, [selectedCategoryName]);

    return (
      <div style={{ marginBottom: "16px" }}>
        <Select
          key={_index}
          defaultValue={value}
          onChange={onChange}
          showSearch
          allowClear={allowClear}
          style={style}
          disabled={false}
          placeholder="Please select a category"
          filterOption={true}
        >
          {_index === 0 &&
            (
              filteredCategories[
                "Super Category"
              ] as unknown as ProductCategory[]
            )?.map((category) => (
              <Select.Option key={category.id} value={category.id}>
                {category[field as keyof ProductCategory]}
              </Select.Option>
            ))}
          {_index === 1 &&
            (
              filteredCategories["Category"] as unknown as ProductCategory[]
            )?.map((category) => (
              <Select.Option key={category.id} value={category.id}>
                {category[field as keyof ProductCategory]}
              </Select.Option>
            ))}
          {_index === 2 &&
            (
              filteredCategories["Sub Category"] as unknown as ProductCategory[]
            )?.map((category) => (
              <Select.Option key={category.id} value={category.id}>
                {category[field as keyof ProductCategory]}
              </Select.Option>
            ))}
          {_index === 3 &&
            (
              filteredCategories[
                "Sub Sub Category"
              ] as unknown as ProductCategory[]
            )?.map((category) => (
              <Select.Option key={category.id} value={category.id}>
                {category[field as keyof ProductCategory]}
              </Select.Option>
            ))}
        </Select>
      </div>
    );
  };
