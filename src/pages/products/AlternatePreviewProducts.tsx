import { Upload } from 'components';
import { Button, Form, message, Spin } from 'antd';
import EditableTable, {
  EditableColumnType,
} from '../../components/EditableTable';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useRequest } from '../../hooks/useRequest';
import { Product } from '../../interfaces/Product';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  saveStagingProduct,
  transferStageProduct,
} from '../../services/DiscoClubService';
import ProductExpandedRow from './ProductExpandedRow';
import CopyIdToClipboard from '../../components/CopyIdToClipboard';
import { ProductBrand } from '../../interfaces/ProductBrand';
import { Image } from '../../interfaces/Image';
import scrollIntoView from 'scroll-into-view';
import { useMount } from 'react-use';

interface AlternatePreviewProductsProps {
  products: Product[];
  productBrands: ProductBrand[];
  allCategories: any;
  onSaveChanges: (product: Product, productIndex: number) => Promise<void>;
  lastViewedIndex: any;
  onRefreshItem: (product: Product) => void;
  onEditProduct: (product: Product, productIndex: number) => void;
  onNextPage: () => void;
  page: number;
  eof: boolean;
}

const AlternatePreviewProducts: React.FC<AlternatePreviewProductsProps> = ({
  products,
  productBrands,
  allCategories,
  onSaveChanges,
  lastViewedIndex,
  onRefreshItem,
  onEditProduct,
  onNextPage,
  page,
  eof,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);

  const [selectedRowKeys, setSelectedRowKeys] = useState<any[]>([]);
  const [_products, _setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const productsMap = new Map<string, Product>();
    products.forEach(product => productsMap.set(product.id, product));
    _setProducts(Array.from(productsMap.values()));
  }, [products]);

  const { doRequest } = useRequest({ setLoading });
  const { doRequest: saveCategories, loading: loadingCategories } =
    useRequest();

  const onFormFinish = async () => {
    setLoading(true);
    try {
      const product = form.getFieldsValue(true);

      const response = (await saveStagingProduct(product)) as any;

      message.success('Register updated with success.');
      setLoading(false);
      onRefreshItem(response.result);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const onSaveCategories = async (record: Product) => {
    await saveCategories(() => saveStagingProduct(record));
    onRefreshItem(record);
  };

  const onSaveProduct = async (record: Product) => {
    await doRequest(() => saveStagingProduct(record));
    onRefreshItem(record);
  };

  const handleThumbnailOrTagReplacement = (
    prevImage: Image,
    product: Product
  ) => {
    if (!product.image.some(img => img.url === prevImage.url)) {
      product.image.push(prevImage);
    }
  };

  const onAssignToTag = (file: any, product: Product) => {
    let imageData = file;
    if (file.response) {
      imageData = {
        uid: file.uid,
        url: file.response.result,
      };
    }
    const prevTag = product.tagImage;
    handleThumbnailOrTagReplacement(prevTag, product);
    product.tagImage = { ...imageData };
    onRefreshItem(product);
  };

  const onAssignToThumbnail = (file: any, product: Product) => {
    let imageData = file;
    if (file.response) {
      imageData = {
        uid: file.uid,
        url: file.response.result,
      };
    }
    const prevThumb = product.thumbnailUrl;
    handleThumbnailOrTagReplacement(prevThumb, product);
    product.thumbnailUrl = { ...imageData };
    onRefreshItem(product);
  };

  const onRollback = (
    oldUrl: string,
    sourceProp: 'image' | 'tagImage' | 'thumbnailUrl' | 'masthead',
    imageIndex: number,
    product: Product
  ) => {
    switch (sourceProp) {
      case 'image':
        product[sourceProp][imageIndex].url = oldUrl;
        break;
      default:
        product[sourceProp].url = oldUrl;
    }
    onRefreshItem(product);
  };

  const onFitTo = (
    fitTo: 'w' | 'h',
    sourceProp: 'image' | 'tagImage' | 'thumbnailUrl',
    imageIndex: number,
    product: Product
  ) => {
    if (!sourceProp) {
      throw new Error('missing sourceProp parameter');
    }
    switch (sourceProp) {
      case 'image':
        if (product[sourceProp][imageIndex].fitTo === fitTo) {
          product[sourceProp][imageIndex].fitTo = undefined;
        } else {
          product[sourceProp][imageIndex].fitTo = fitTo;
        }
        break;
      default:
        if (product[sourceProp].fitTo === fitTo) {
          product[sourceProp].fitTo = undefined;
        } else {
          product[sourceProp].fitTo = fitTo;
        }
    }
    onRefreshItem(product);
  };

  const onImageChange = (
    image: Image,
    sourceProp: 'image' | 'tagImage' | 'thumbnailUrl' | 'masthead',
    product: Product,
    removed?: boolean
  ) => {
    if (removed) {
      switch (sourceProp) {
        case 'image':
          product[sourceProp] = product[sourceProp].filter(
            img => img.uid !== image.uid
          );
          break;
        default:
          product[sourceProp] = undefined as any;
      }
    } else {
      switch (sourceProp) {
        case 'image':
          product[sourceProp] = [...(product[sourceProp] || []), image];
          break;
        default:
          product[sourceProp] = image;
      }
    }
  };

  const columns: EditableColumnType<Product>[] = [
    {
      title: 'Id',
      dataIndex: 'id',
      width: '6%',
      render: id => <CopyIdToClipboard id={id} />,
      align: 'center',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      width: '10%',
      render: (value: string, record: Product, index: number) => (
        <Link
          onClick={() => onEditProduct(record, index)}
          to={{ pathname: window.location.pathname, state: record }}
        >
          {value}
        </Link>
      ),
    },
    {
      title: 'Tag Image',
      dataIndex: ['tagImage'],
      width: '15%',
      align: 'center',
      render: (_, record) => (
        <Form.Item>
          <Upload.ImageUpload
            fileList={record.tagImage}
            formProp="tagImage"
            form={form}
            onFitTo={(fitTo, sourceProp, imageIndex) => {
              onFitTo(fitTo, sourceProp, imageIndex, record);
            }}
            onRollback={(oldUrl, sourceProp, imageIndex) =>
              onRollback(oldUrl, sourceProp, imageIndex, record)
            }
            onImageChange={(image, sourceProp, removed) =>
              onImageChange(image, sourceProp, record, removed)
            }
          />
        </Form.Item>
      ),
    },
    {
      title: 'Thumbnail',
      dataIndex: ['thumbnailUrl'],
      width: '15%',
      align: 'center',
      render: (_, record) => (
        <div className="images-content">
          <Form.Item>
            <Upload.ImageUpload
              fileList={record.thumbnailUrl}
              formProp="thumbnailUrl"
              form={form}
              onFitTo={(fitTo, sourceProp, imageIndex) => {
                onFitTo(fitTo, sourceProp, imageIndex, record);
              }}
              onRollback={(oldUrl, sourceProp, imageIndex) =>
                onRollback(oldUrl, sourceProp, imageIndex, record)
              }
              onImageChange={(image, sourceProp, removed) =>
                onImageChange(image, sourceProp, record, removed)
              }
            />
          </Form.Item>
        </div>
      ),
    },
    {
      title: 'Image',
      dataIndex: ['image'],
      width: '40%',
      align: 'left',
      ellipsis: true,
      render: (_, record) => {
        return (
          <div className="images-wrapper">
            <div className="images-content">
              <Form.Item>
                <Upload.ImageUpload
                  maxCount={20}
                  fileList={record.image}
                  formProp="image"
                  form={form}
                  onAssignToTag={file => onAssignToTag(file, record)}
                  onAssignToThumbnail={file =>
                    onAssignToThumbnail(file, record)
                  }
                  croppable
                  scrollOverflow
                  onImageChange={(image, sourceProp, removed) =>
                    onImageChange(image, sourceProp, record, removed)
                  }
                  onRollback={(oldUrl, sourceProp, imageIndex) =>
                    onRollback(oldUrl, sourceProp, imageIndex, record)
                  }
                />
              </Form.Item>
            </div>
          </div>
        );
      },
    },
    {
      title: 'Actions',
      key: 'action',
      width: '15%',
      align: 'center',
      render: (_, record, index) => (
        <>
          <Button
            type="primary"
            loading={loading}
            onClick={() => onSaveChanges(record, index)}
          >
            Save Changes
          </Button>
          <Button
            onClick={() => handleStage(record.id)}
            type="primary"
            style={{ margin: '0.5rem' }}
            className="success-button"
          >
            Promote
          </Button>
        </>
      ),
    },
  ];

  const handleStage = async (productId: string) => {
    await doRequest(() => transferStageProduct(productId), 'Product commited.');
  };

  useMount(() => {
    scrollIntoView(
      document.querySelector(
        `.scrollable-row-${lastViewedIndex}`
      ) as HTMLElement
    );
  });

  return (
    <Form
      form={form}
      name="productForm"
      onFinish={onFormFinish}
      onFinishFailed={({ errorFields }) => {
        errorFields.forEach(errorField => {
          message.error(errorField.errors[0]);
        });
      }}
    >
      <InfiniteScroll
        dataLength={_products.length}
        next={onNextPage}
        hasMore={!eof}
        loader={
          page !== 0 && (
            <div className="scroll-message">
              <Spin />
            </div>
          )
        }
        endMessage={
          <div className="scroll-message">
            <b>End of results.</b>
          </div>
        }
      >
        <EditableTable
          rowClassName={(_, index) =>
            `scrollable-row-${index} ${
              index === lastViewedIndex ? 'selected-row' : ''
            }`
          }
          rowKey="id"
          columns={columns}
          dataSource={_products}
          loading={loading}
          onSave={onSaveProduct}
          pagination={false}
          rowSelection={{
            selectedRowKeys,
            onChange: setSelectedRowKeys,
          }}
          expandable={{
            expandedRowRender: (record: Product) => (
              <ProductExpandedRow
                key={record.id}
                record={record}
                allCategories={allCategories}
                onSaveProduct={onSaveCategories}
                loading={loadingCategories}
                isStaging
                productBrands={productBrands}
              ></ProductExpandedRow>
            ),
          }}
        />
      </InfiniteScroll>
    </Form>
  );
};

export default AlternatePreviewProducts;
