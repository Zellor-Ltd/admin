import { Typography } from "antd";
import Select from "antd/lib/select";
import React, { useEffect, useState } from "react";
import { BrandVault } from "../interfaces/BrandVault";
import { fetchBrandVault } from "../services/DiscoClubService";

type SelectBrandVaultProps = Omit<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  "onChange"
> & {
  onChange: (selectedVault: BrandVault) => {};
  allowClear: boolean;
  initialShopName?: string;
  label?: string;
};

export const SelectBrandVault: React.FC<SelectBrandVaultProps> = ({
  onChange,
  placeholder = "Select a brand vault",
  style,
  allowClear,
  initialShopName = "",
  label = "Brand Vault Filter",
}) => {
  const [vault, setVault] = useState<BrandVault[]>([]);
  const [selectedVault, setselectedVault] = useState<string>(initialShopName);

  const _onChange = (value: string) => {
    setselectedVault(value);
    onChange(vault.find((brand) => brand.shopName === value) as BrandVault);
  };

  return (
    <div style={{ marginBottom: "16px" }}>
      <Typography.Title level={5} title={label}>
        {label}
      </Typography.Title>
      <Select
        value={selectedVault}
        onChange={_onChange}
        showSearch
        allowClear={allowClear}
        style={style}
        placeholder={placeholder}
      >
        {vault.map(({ shopName }) => (
          <Select.Option key={shopName} value={shopName}>
            {shopName}
          </Select.Option>
        ))}
      </Select>
    </div>
  );
};
