import { Typography } from "antd";
import Select from "antd/lib/select";
import React, { useEffect, useState } from "react";
import { Brand } from "../interfaces/Brand";
import { fetchBrands } from "../services/DiscoClubService";

type SelectBrandProps = Omit<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  "onChange"
> & {
  onChange: (selectedBrand: Brand) => {};
  allowClear: boolean;
  initialBrandName?: string;
  label?: string;
};

export const SelectBrandVault: React.FC<SelectBrandProps> = ({
  onChange,
  placeholder = "Select a brand",
  style,
  allowClear,
  initialBrandName = "",
  label = "Brand Filter",
}) => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedBrandName, setSelectedBrandName] =
    useState<string>(initialBrandName);

  const _onChange = (value: string) => {
    setSelectedBrandName(value);
    onChange(brands.find((brand) => brand.brandName === value) as Brand);
  };

  useEffect(() => {
    const getBrands = async () => {
      try {
        const { results }: any = await fetchBrands();
        setBrands(results);
      } catch (e) {}
    };
    getBrands();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ marginBottom: "16px" }}>
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
