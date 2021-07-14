import { MinusOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Col, Form, FormInstance, Row } from "antd";
import { AllCategories, SelectedProductCategories } from "interfaces/Category";
import { Product } from "interfaces/Product";
import { useState } from "react";
import ProductCategories from "./ProductCategories";

interface ProductCategoriesTreesProps {
  record: Product;
  allCategories: AllCategories;
  form: FormInstance;
}

const ProductCategoriesTrees: React.FC<ProductCategoriesTreesProps> = ({
  record,
  allCategories,
  form,
}) => {
  console.log("render Trees");

  const [categories, setCategories] = useState<any[]>(
    record.categories || [{}]
  );

  const addCategoryTree = () => {
    setCategories((prev) => [...prev, {}]);
  };

  const delCategoryTree = (index: number) => {
    const formCategories = form.getFieldValue("categories");
    form.setFieldsValue({
      categories: [
        ...formCategories.slice(0, index),
        ...formCategories.slice(index + 1),
      ],
    });
    setCategories((prev) => [
      ...prev.slice(0, index),
      ...prev.slice(index + 1),
    ]);
  };

  const handleCategoryChange = (
    selectedCategories: any,
    productCategoryIndex: number,
    filterCategory: Function
  ) => {
    filterCategory(form);
  };

  return (
    <>
      <Col lg={24} xs={12}>
        {categories.map((_: any, index: number) => (
          <Row
            key={index}
            justify="space-between"
            style={{ maxWidth: "1000px" }}
          >
            <ProductCategories
              productCategoryIndex={index}
              initialValues={categories as SelectedProductCategories[]}
              allCategories={allCategories}
              handleCategoryChange={handleCategoryChange}
            />
            {categories.length > 1 ? (
              <Button
                onClick={() => delCategoryTree(index)}
                type="link"
                style={{ padding: 0, marginTop: "30px" }}
              >
                Remove Category Tree
                <MinusOutlined />
              </Button>
            ) : (
              <div style={{ width: "168px" }}></div>
            )}
          </Row>
        ))}
        <Button
          onClick={addCategoryTree}
          type="link"
          style={{ padding: 0, marginTop: "-6px", marginBottom: "16px" }}
        >
          Add Category Tree
          <PlusOutlined />
        </Button>
      </Col>
    </>
  );
};

export default ProductCategoriesTrees;
