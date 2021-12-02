import { Typography } from 'antd';
import Select from 'antd/lib/select';
import React, { useEffect, useState } from 'react';
import { ProductBrand } from '../interfaces/ProductBrand';
import { fetchProductBrands } from '../services/DiscoClubService';

type SelectProductBrandProps = Omit<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  'onChange'
> & {
  onChange: (selectedProductBrand: ProductBrand) => {} | void;
  allowClear?: boolean;
  initialBrandName?: string;
  label?: string;
};

export const SelectProductBrandSmartSearch: React.FC<SelectProductBrandProps> =
  ({
    onChange,
    placeholder = 'Select a product brand',
    style,
    allowClear = true,
    initialBrandName = '',
    label = 'Product Brand',
  }) => {
    const [productBrands, setProductBrands] = useState<ProductBrand[]>([]);
    const [selectedBrandName, setSelectedBrandName] =
      useState<string>(initialBrandName);

    const _onChange = (value: string) => {
      setSelectedBrandName(value);
      onChange(
        productBrands.find(brand => brand.brandName === value) as ProductBrand
      );
    };

    useEffect(() => {
      const getProductBrands = async () => {
        try {
          const { results }: any = await fetchProductBrands();
          setProductBrands(
            results.filter((productBrand: any) => productBrand.brandName)
          );
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
          value={selectedBrandName}
          onChange={_onChange}
          showSearch
          allowClear={allowClear}
          style={style}
          placeholder={placeholder}
          filterOption={true}
        >
          {productBrands.map(productBrand => (
            <Select.Option key={productBrand.id} value={productBrand.brandName}>
              {productBrand.brandName}
            </Select.Option>
          ))}
        </Select>
      </div>
    );
  };
