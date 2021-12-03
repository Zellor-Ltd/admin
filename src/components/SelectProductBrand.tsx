import Select from 'antd/lib/select';
import React, { useEffect, useState } from 'react';
import { ProductBrand } from '../interfaces/ProductBrand';
import { fetchProductBrands } from '../services/DiscoClubService';
import { FormInstance } from 'antd/lib/form';

type SelectProductBrandProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  allowClear?: boolean;
  initialProductBrandName?: string;
  label?: string;
  handleProductBrandChange: Function;
};

export const SelectProductBrand: React.FC<SelectProductBrandProps> = ({
  placeholder = 'Select a Brand',
  style,
  allowClear = true,
  initialProductBrandName,
  handleProductBrandChange,
}) => {
  const [productBrands, setProductBrands] = useState<ProductBrand[]>([]);
  const [selectedProductBrandName, setSelectedProductBrandName] =
    useState<string>(initialProductBrandName as string);

  const getProductBrands = async () => {
    try {
      const { results }: any = await fetchProductBrands();
      setProductBrands(results);
    } catch (e) {}
  };

  useEffect(() => {
    getProductBrands();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const _onChange = (value: string) => {
    setSelectedProductBrandName(value);

    const productBrand = productBrands.find(
      prodBrand => prodBrand.brandName === value
    );

    handleProductBrandChange((form: FormInstance) => {
      form.setFieldsValue({ productBrand: value });
    }, productBrand);
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
