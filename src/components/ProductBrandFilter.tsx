import { Typography } from 'antd';
import Select from 'antd/lib/select';
import React, { useState } from 'react';
import { ProductBrand } from '../interfaces/ProductBrand';

type ProductBrandFilterProps = Omit<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  'onChange'
> & {
  onChange: (selectedBrand: ProductBrand) => {};
  allowClear?: boolean;
  initialProductBrandName?: string;
  label?: string;
  productBrands: ProductBrand[];
};

export const ProductBrandFilter: React.FC<ProductBrandFilterProps> = ({
  onChange,
  placeholder = 'Select a Brand',
  style,
  allowClear = true,
  initialProductBrandName,
  label = 'Product Brand',
  productBrands,
}) => {
  const [selectedProductBrandName, setSelectedProductBrandName] =
    useState<string>(initialProductBrandName as string);

  const _onChange = (value: string) => {
    setSelectedProductBrandName(value);
    onChange(productBrands.find(brand => brand.id === value) as ProductBrand);
  };

  return (
    <div style={{ marginBottom: '16px' }}>
      <Typography.Title level={5} title={label}>
        {label}
      </Typography.Title>
      <Select
        value={selectedProductBrandName}
        onChange={_onChange}
        showSearch
        allowClear={allowClear}
        style={style}
        placeholder={placeholder}
        filterOption={(input?: string, value?: any) =>
          value?.children.toLowerCase().includes(input?.toLowerCase())
        }
      >
        {productBrands.map(({ brandName, id }) => (
          <Select.Option key={id} value={id}>
            {brandName}
          </Select.Option>
        ))}
      </Select>
    </div>
  );
};
