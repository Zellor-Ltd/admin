import Select from "antd/lib/select";
import React, { useEffect, useState } from "react";
import { fetchBrands } from "../services/DiscoClubService";
import { Brand } from "../interfaces/Brand";

type SelectBrandProps = Omit<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  "onChange"
> & {
  onChange: (selectedBrand: Brand) => {};
  allowClear: boolean;
};

export const SelectBrand: React.FC<SelectBrandProps> = ({
  onChange,
  placeholder = "Select a brand",
  style,
  allowClear,
}) => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string>("");

  useEffect(() => {
    const getBrands = async () => {
      try {
        const { results }: any = await fetchBrands();
        setBrands(results);
      } catch (e) {}
    };
    getBrands();
  }, []);

  const _onChange = (value: string) => {
    setSelectedBrand(value);
    onChange(brands.find((brand) => brand.brandName === value) as Brand);
  };

  return (
    <Select
      value={selectedBrand}
      onChange={_onChange}
      showSearch
      allowClear
      style={style}
      placeholder={placeholder}
    >
      {brands.map(({ brandName, brandId }) => (
        <Select.Option key={brandName} value={brandId}>
          {brandName}
        </Select.Option>
      ))}
    </Select>
  );
};
