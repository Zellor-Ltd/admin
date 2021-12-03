import { Typography } from 'antd';
import Select from 'antd/lib/select';
import React, { useEffect, useState } from 'react';
import { ProductBrand } from '../interfaces/ProductBrand';
import { fetchProductBrands } from '../services/DiscoClubService';

type ProductBrandFilterProps = Omit<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  'onChange'
> & {
  onChange: (selectedBrand: ProductBrand) => {};
  allowClear?: boolean;
  initialProductBrandName?: string;
  label?: string;
};

export const ProductBrandFilter: React.FC<ProductBrandFilterProps> = ({
  onChange,
  placeholder = 'Select a Brand',
  style,
  allowClear = true,
  initialProductBrandName,
  label = 'Product Brand',
}) => {
  const [productBrands, setProductBrands] = useState<ProductBrand[]>([]);
  const [selectedProductBrandName, setSelectedProductBrandName] =
    useState<string>(initialProductBrandName as string);

  const _onChange = (value: string) => {
    setSelectedProductBrandName(value);
    onChange(productBrands.find(brand => brand.id === value) as ProductBrand);
  };

  useEffect(() => {
    const getProductBrands = async () => {
      try {
        const { results }: any = await fetchProductBrands();
        setProductBrands(results);
      } catch (e) {}
    };
    getProductBrands();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
