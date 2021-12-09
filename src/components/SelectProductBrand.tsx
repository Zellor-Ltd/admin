import Select from 'antd/lib/select';
import React, { useState } from 'react';
import { ProductBrand } from '../interfaces/ProductBrand';
import { FormInstance } from 'antd/lib/form';

type SelectProductBrandProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  allowClear?: boolean;
  initialProductBrandName?: string;
  label?: string;
  handleProductBrandChange: Function;
  productBrands: ProductBrand[];
};

export const SelectProductBrand: React.FC<SelectProductBrandProps> = ({
  placeholder = 'Select a Brand',
  style,
  allowClear = true,
  initialProductBrandName,
  handleProductBrandChange,
  productBrands,
}) => {
  const [selectedProductBrandName, setSelectedProductBrandName] =
    useState<string>(initialProductBrandName as string);

  const _onChange = (value: string) => {
    setSelectedProductBrandName(value);

    handleProductBrandChange((form: FormInstance) => {
      const formProductBrand = productBrands.find(
        productBrand => productBrand.brandName === value
      ) as ProductBrand;
      form.setFieldsValue({ productBrand: formProductBrand });
    });
  };

  return (
    <Select
      defaultValue={initialProductBrandName}
      value={selectedProductBrandName}
      showSearch
      allowClear={allowClear}
      style={style}
      placeholder={placeholder}
      onChange={_onChange}
    >
      {productBrands.map(productBrand => (
        <Select.Option key={productBrand.id} value={productBrand.brandName}>
          {productBrand.brandName}
        </Select.Option>
      ))}
    </Select>
  );
};
