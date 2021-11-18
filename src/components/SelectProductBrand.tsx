import Select from "antd/lib/select";
import React, { useEffect, useState } from "react";
import { ProductBrand } from "../interfaces/ProductBrand";
import { fetchProductBrands } from "../services/DiscoClubService";

type SelectProductBrandProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  allowClear?: boolean;
  initialProductBrandName?: string;
  label?: string;
};

export const SelectProductBrand: React.FC<SelectProductBrandProps> = ({
  placeholder = "Select a Brand",
  style,
  allowClear = true,
}) => {
  const [productBrands, setProductBrands] = useState<ProductBrand[]>([]);

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

  return (
    <Select
      showSearch
      allowClear={allowClear}
      style={style}
      placeholder={placeholder}
    >
      {productBrands.map(({ brandName, id }) => (
        <Select.Option key={id} value={brandName}>
          {brandName}
        </Select.Option>
      ))}
    </Select>
  );
};
