import Select from "antd/lib/select";
import React, { useEffect, useState } from "react";
import { Brand } from "../interfaces/Brand";
import { fetchBrands } from "../services/DiscoClubService";

type SelectBrandProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  allowClear?: boolean;
  initialBrandName?: string;
  label?: string;
};

export const SelectBrandSmartSearch: React.FC<SelectBrandProps> = ({
  placeholder = "Select a Brand",
  style,
  allowClear = true,
  initialBrandName = "",
}) => {
  const [brands, setBrands] = useState<Brand[]>([]);

  const getBrands = async () => {
    try {
      const { results }: any = await fetchBrands();
      setBrands(results);
    } catch (e) {}
  };

  useEffect(() => {
    getBrands();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Select
      value={initialBrandName}
      showSearch
      allowClear={allowClear}
      style={style}
      placeholder={placeholder}
    >
      {brands.map(({ brandName, id }) => (
        <Select.Option key={id} value={brandName}>
          {brandName}
        </Select.Option>
      ))}
    </Select>
  );
};
