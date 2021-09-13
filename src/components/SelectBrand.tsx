import Select from "antd/lib/select";
import React, { useContext, useEffect, useState } from "react";
import { fetchBrands } from "../services/DiscoClubService";
import { Brand } from "../interfaces/Brand";
import { Typography } from "antd";
import { AppContext } from "contexts/AppContext";

type SelectBrandProps = Omit<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  "onChange"
> & {
  onChange: (selectedBrand: Brand) => {};
  allowClear: boolean;
  label?: string;
};

export const SelectBrand: React.FC<SelectBrandProps> = ({
  onChange,
  placeholder = "Select a brand",
  style,
  allowClear,
  label = "Brand Filter",
}) => {
  const { filterValues, setFilterValues } = useContext(AppContext);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string>(
    filterValues[label]
  );

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
    setFilterValues((prev) => ({ ...prev, [label]: value }));
    onChange(brands.find((brand) => brand.brandName === value) as Brand);
  };

  return (
    <div style={{ marginBottom: "16px" }}>
      <Typography.Title level={5} title={label}>
        {label}
      </Typography.Title>
      <Select
        value={selectedBrand}
        onChange={_onChange}
        showSearch
        allowClear={allowClear}
        style={style}
        placeholder={placeholder}
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
