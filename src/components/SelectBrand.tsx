import { Typography } from 'antd';
import Select from 'antd/lib/select';
import React, { useEffect, useState } from 'react';
import { Brand } from '../interfaces/Brand';
import { fetchBrands } from '../services/DiscoClubService';

type SelectBrandProps = Omit<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  'onChange'
> & {
  onChange: (selectedBrand: Brand) => {};
  allowClear?: boolean;
  initialBrandName?: string;
  label?: string;
};

export const SelectBrand: React.FC<SelectBrandProps> = ({
  onChange,
  placeholder = 'Select a master brand',
  style,
  allowClear = true,
  initialBrandName,
  label = 'Master Brand',
}) => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedBrandName, setSelectedBrandName] = useState<
    string | undefined
  >(initialBrandName);
  const [isLoading, setIsLoading] = useState(false);

  const _onChange = (value: string) => {
    setSelectedBrandName(value);
    onChange(brands.find(brand => brand.brandName === value) as Brand);
  };

  useEffect(() => {
    const getBrands = async () => {
      try {
        setIsLoading(true);
        const { results }: any = await fetchBrands();
        setBrands(results.filter((brand: any) => brand.brandName));
      } catch (e) {
      } finally {
        setIsLoading(false);
      }
    };
    getBrands();
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
        loading={isLoading}
        disabled={isLoading}
      >
        {brands.map(({ brandName, brandId }) => (
          <Select.Option key={brandName} value={brandId}>
            {brandName}
          </Select.Option>
        ))}
      </Select>
    </div>
  );
};
