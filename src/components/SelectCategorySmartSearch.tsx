import Select from 'antd/lib/select';
import useAllCategories from '../hooks/useAllCategories';
import React, { useEffect } from 'react';
import {
  AllCategories,
  ProductCategory,
  SelectedCategories,
  SelectedProductCategories,
} from '../interfaces/Category';

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
  disabled: boolean;
  treeIndex: number;
  onChange: (_: any, option: any) => void;
}

const formatProductCategories: (
  initialProductCategories: SelectedProductCategories
) => SelectedCategories = initialProductCategories => {
  const initialCategories: SelectedCategories = {
    superCategory: '',
  };
  Object.keys(initialProductCategories).forEach(key => {
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
    initialValues,
    _index,
    disabled,
    treeIndex,
    onChange,
  }) => {
    const { filteredCategories } = useAllCategories({
      initialValues: formatProductCategories(initialValues[0]),
      allCategories,
    });
    const defaultValues = [
      initialValues[0].superCategory?.superCategory as string,
      initialValues[0].category?.category as string,
      initialValues[0].subCategory?.subCategory as string,
      initialValues[0].subSubCategory?.subSubCategory as string,
      initialValues[1]?.superCategory?.superCategory as string,
      initialValues[1]?.category?.category as string,
      initialValues[1]?.subCategory?.subCategory as string,
      initialValues[1]?.subSubCategory?.subSubCategory as string,
    ];

    useEffect(() => {});

    return (
      <div style={{ marginBottom: '16px' }}>
        <Select
          key={_index}
          onChange={onChange}
          defaultValue={
            treeIndex === 0
              ? defaultValues[_index]
              : treeIndex === 1
              ? defaultValues[_index + 4]
              : undefined
          }
          showSearch
          allowClear={allowClear}
          style={style}
          disabled={disabled}
          placeholder="Please select a category"
          filterOption={true}
        >
          {_index === 0 &&
            (
              filteredCategories[
                'Super Category'
              ] as unknown as ProductCategory[]
            )?.map(category => (
              <Select.Option
                key={category.id}
                value={category.superCategory as string}
              >
                {category.superCategory}
              </Select.Option>
            ))}
          {_index === 1 &&
            (
              filteredCategories['Category'] as unknown as ProductCategory[]
            )?.map(category => (
              <Select.Option
                key={category.id}
                value={category.category as string}
              >
                {category.category}
              </Select.Option>
            ))}
          {_index === 2 &&
            (
              filteredCategories['Sub Category'] as unknown as ProductCategory[]
            )?.map(category => (
              <Select.Option
                key={category.id}
                value={category.subCategory as string}
              >
                {category.subCategory}
              </Select.Option>
            ))}
          {_index === 3 &&
            (
              filteredCategories[
                'Sub Sub Category'
              ] as unknown as ProductCategory[]
            )?.map(category => (
              <Select.Option
                key={category.id}
                value={category.subSubCategory as string}
              >
                {category.subSubCategory}
              </Select.Option>
            ))}
        </Select>
      </div>
    );
  };
