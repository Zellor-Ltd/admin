import Select from "antd/lib/select";
import React, { useEffect, useState } from "react";
import { Brand } from "../interfaces/Brand";
import { fetchBrands } from "../services/DiscoClubService";
import { FormInstance } from "antd/lib/form";

type SelectBrandProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  allowClear?: boolean;
  initialBrandName?: string;
  label?: string;
  handleMasterBrandChange: Function;
};

export const SelectBrandSmartSearch: React.FC<SelectBrandProps> = ({
  placeholder = "Select a Brand",
  style,
  allowClear = true,
  initialBrandName = "",
  handleMasterBrandChange,
}) => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedBrandName, setSelectedBrandName] =
    useState<string>(initialBrandName);

  const getBrands = async () => {
    try {
      const { results }: any = await fetchBrands();
      setBrands(results);
    } catch (e) {}
  };

  const _onChange = (value: string) => {
    setSelectedBrandName(value);

    handleMasterBrandChange((form: FormInstance) => {
      const formMasterBrand = brands.find(
        (brand) => brand.brandName === value
      ) as Brand;
      form.setFieldsValue({ brand: formMasterBrand });
    });
  };

  useEffect(() => {
    getBrands();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Select
      value={selectedBrandName}
      showSearch
      allowClear={allowClear}
      style={style}
      placeholder={placeholder}
      onChange={_onChange}
      filterOption={true}
    >
      {brands.map((brand) => (
        <Select.Option key={brand.id} value={brand.brandName}>
          {brand.brandName}
        </Select.Option>
      ))}
    </Select>
  );
};
