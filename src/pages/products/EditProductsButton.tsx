import { Button } from "antd";
import { Product } from "interfaces/Product";
import React, { useEffect, useState } from "react";
import EditProductModal from "./EditProductModal";

interface EditProductsButtonProps {
  products: Product[];
  selectedRowKeys: any[];
  loading: boolean;
  onOk: Function;
}

const EditProductsButton: React.FC<EditProductsButtonProps> = ({
  products,
  selectedRowKeys,
  loading,
  onOk,
}) => {
  const [showEditProductModal, setShowEditProductModal] =
    useState<boolean>(false);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);

  useEffect(() => {
    setSelectedProducts(
      products.filter((product) => selectedRowKeys.includes(product.id))
    );
  }, [products, selectedRowKeys]);

  const _onOk = () => {
    setShowEditProductModal(false);
    onOk();
  };

  const onCancel = () => {
    setShowEditProductModal(false);
  };

  return (
    <div style={{ marginBottom: "16px" }}>
      <Button
        type="primary"
        onClick={() => setShowEditProductModal(true)}
        disabled={selectedProducts.length === 0}
        loading={loading}
      >
        Edit Products
      </Button>
      <EditProductModal
        visible={showEditProductModal}
        selectedProducts={selectedProducts}
        onCancel={onCancel}
        onOk={_onOk}
      />
    </div>
  );
};

export default EditProductsButton;
