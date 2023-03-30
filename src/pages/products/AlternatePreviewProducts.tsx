import { Upload } from 'components';
import { Button, Form, Input, message, Popover, Spin, Tooltip } from 'antd';
import EditableTable, {
  EditableColumnType,
} from '../../components/EditableTable';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useRequest } from '../../hooks/useRequest';
import { Product } from '../../interfaces/Product';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  exportToShopifyProduct,
  saveStagingProduct,
  transferStageProduct,
} from '../../services/DiscoClubService';
import ProductExpandedRow from './ProductExpandedRow';
import CopyValueToClipboard from '../../components/CopyValueToClipboard';
import { ProductBrand } from '../../interfaces/ProductBrand';
import { Image } from '../../interfaces/Image';
import scrollIntoView from 'scroll-into-view';
import { useMount } from 'react-use';
import { SketchPicker } from 'react-color';
import { AppContext } from 'contexts/AppContext';

interface AlternatePreviewProductsProps {
  loadedRef: any;
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
  disabled: boolean;
  selectedRowKeys: any[];
  setSelectedRowKeys: (keys: string[]) => void;
  setSelectedRows: (rows: Product[]) => void;
}

const AlternatePreviewProducts: React.FC<AlternatePreviewProductsProps> = ({
  loadedRef,
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
  disabled,
  selectedRowKeys,
  setSelectedRowKeys,
  setSelectedRows,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);
  const [_products, _setProducts] = useState<Product[]>([]);
  const viewPicker = useRef<boolean>(false);
  const { isMobile } = useContext(AppContext);
  const [btnStyle, setBtnStyle] = useState<any>();

  useEffect(() => {
    if (isMobile)
      setBtnStyle({ position: 'fixed', top: '17rem', right: '3.5rem' });
    else setBtnStyle({ position: 'fixed', top: '25.5rem', left: '15rem' });
  }, [isMobile]);

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

  const refreshTable = (item: Product, index: number) => {
    _products[index] = item;
    _setProducts([..._products]);
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

  const handleColourFocus = () => {
    viewPicker.current = true;
  };

  const handleColourChange = (
    value: string,
    product: Product,
    index: number
  ) => {
    product.colour = value;
    refreshTable(product, index);
  };

  const columns: EditableColumnType<Product>[] = [
    {
      title: (
        <div style={{ display: 'grid', placeItems: 'stretch' }}>
          <div
            style={{
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            <Tooltip title="ID">ID</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'id',
      width: '5%',
      align: 'center',
      shouldCellUpdate: () => false,
      render: id => <CopyValueToClipboard value={id} />,
    },
    {
      title: (
        <div style={{ display: 'grid', placeItems: 'stretch' }}>
          <div
            style={{
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            <Tooltip title="Name">Name</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'name',
      width: '10%',
      shouldCellUpdate: () => false,
      render: (value: string, record: Product, index: number) => (
        <Tooltip title={value}>
          <Link
            onClick={() => onEditProduct(record, index)}
            to={{ pathname: window.location.pathname, state: record }}
          >
            {value}
          </Link>
        </Tooltip>
      ),
    },
    {
      title: (
        <div style={{ display: 'grid', placeItems: 'stretch' }}>
          <div
            style={{
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            <Tooltip title="Tag Image">Tag Image</Tooltip>
          </div>
        </div>
      ),
      dataIndex: ['tagImage'],
      width: '10%',
      align: 'left',
      shouldCellUpdate: (prevRecord, nextRecord) =>
        prevRecord['tagImage'] !== nextRecord['tagImage'],
      render: (_, record) => (
        <Form.Item className="mb-0 mt-1">
          <Upload.ImageUpload
            type="tag"
            scrollOverflow
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
      title: (
        <div style={{ display: 'grid', placeItems: 'stretch' }}>
          <div
            style={{
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            <Tooltip title="Thumbnail">Thumbnail</Tooltip>
          </div>
        </div>
      ),
      dataIndex: ['thumbnailUrl'],
      width: '10%',
      align: 'left',
      shouldCellUpdate: (prevRecord, nextRecord) =>
        prevRecord['thumbnailUrl'] !== nextRecord['thumbnailUrl'],
      render: (_, record) => (
        <Form.Item className="mb-0 mt-1">
          <Upload.ImageUpload
            type="thumbnail"
            scrollOverflow
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
      ),
    },
    {
      title: (
        <div style={{ display: 'grid', placeItems: 'stretch' }}>
          <div
            style={{
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            <Tooltip title="Image">Image</Tooltip>
          </div>
        </div>
      ),
      dataIndex: ['image'],
      width: '20%',
      align: 'left',
      shouldCellUpdate: (prevRecord, nextRecord) =>
        prevRecord['image'] !== nextRecord['image'],
      render: (_, record) => {
        return (
          <Form.Item className="mb-0 mt-1">
            <Upload.ImageUpload
              type="image"
              maxCount={20}
              fileList={record.image}
              formProp="image"
              form={form}
              onAssignToTag={file => onAssignToTag(file, record)}
              onAssignToThumbnail={file => onAssignToThumbnail(file, record)}
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
        );
      },
    },
    {
      title: (
        <div style={{ display: 'grid', placeItems: 'stretch' }}>
          <div
            style={{
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            <Tooltip title="Variant">Variant</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'variantId',
      width: '10%',
      shouldCellUpdate: (prevRecord, nextRecord) =>
        prevRecord.variantId !== nextRecord.variantId,
      render: (value: string, record: Product) => (
        <Tooltip
          placement="topLeft"
          title={record.variantId}
          className="repositioned-grid-item"
        >
          <Input
            allowClear
            onChange={event => (record.variantId = event.target.value)}
            placeholder="Variant ID"
            defaultValue={value}
            pattern="^.{8}-.{4}-.{4}-.{4}-.{12}_STR$"
          />
        </Tooltip>
      ),
    },
    {
      title: (
        <div style={{ display: 'grid', placeItems: 'stretch' }}>
          <div
            style={{
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            <Tooltip title="Colour">Colour</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'colour',
      width: '10%',
      shouldCellUpdate: (prevRecord, nextRecord) =>
        prevRecord.colour !== nextRecord.colour,
      render: (value: string, record: Product, index: number) => (
        <div
          className="grid-color mb-0 mt-1"
          style={{
            background: record.colour ?? '#FFFFFF',
          }}
        >
          <Tooltip placement="topLeft" title={record.colour ?? 'null'}>
            <Popover
              placement="bottomLeft"
              content={
                viewPicker && (
                  <div onBlur={() => (viewPicker.current = false)}>
                    <SketchPicker
                      color={record.colour ?? '#FFFFFF'}
                      disableAlpha
                      onChange={selectedColour =>
                        handleColourChange(selectedColour.hex, record, index)
                      }
                      presetColors={[
                        '#4a2f10',
                        '#704818',
                        '#9e6521',
                        '#C37D2A',
                        '#E5AC69',
                        '#F2C590',
                        '#FFD6A6',
                        '#FFF0CB',
                      ]}
                    />
                  </div>
                )
              }
              trigger="click"
            >
              <Button
                onClick={handleColourFocus}
                ghost
                block
                style={{
                  height: '100%',
                  color: record.colour ?? 'gray',
                  border: '1px solid #d9d9d9',
                }}
              >
                {record.colour ?? 'null'}
              </Button>
            </Popover>
          </Tooltip>
        </div>
      ),
    },
    {
      title: (
        <div style={{ display: 'grid', placeItems: 'stretch' }}>
          <div
            style={{
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            <Tooltip title="Colour Title">Colour Title</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'colourTitle',
      width: '10%',
      shouldCellUpdate: (prevRecord, nextRecord) =>
        prevRecord.colourTitle !== nextRecord.colourTitle,
      render: (value: string, record: Product) => (
        <Tooltip
          placement="topLeft"
          title={record.colourTitle}
          className="repositioned-grid-item"
        >
          <Input
            allowClear
            onChange={event => (record.colourTitle = event.target.value)}
            placeholder="Colour name"
            defaultValue={value}
          />
        </Tooltip>
      ),
    },
    {
      title: (
        <div style={{ display: 'grid', placeItems: 'stretch' }}>
          <div
            style={{
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            <Tooltip title="Size">Size</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'size',
      width: '10%',
      shouldCellUpdate: (prevRecord, nextRecord) =>
        prevRecord.size !== nextRecord.size,
      render: (value: string, record: Product) => (
        <Tooltip
          placement="topLeft"
          title={record.size}
          className="repositioned-grid-item"
        >
          <Input
            allowClear
            onChange={event => (record.size = event.target.value)}
            placeholder="Size"
            defaultValue={value}
          />
        </Tooltip>
      ),
    },
    {
      title: (
        <div style={{ display: 'grid', placeItems: 'stretch' }}>
          <div
            style={{
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            <Tooltip title="Actions">Actions</Tooltip>
          </div>
        </div>
      ),
      key: 'action',
      width: '12%',
      align: 'center',
      shouldCellUpdate: () => false,
      render: (_, record, index) => (
        <>
          <Button
            type="primary"
            loading={loading}
            onClick={() => onSaveChanges(record, index)}
            disabled={loading}
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
          <Button
            onClick={() => handleUploadToShopify(record.id)}
            type="default"
            style={{ margin: '0.5rem' }}
          >
            Upload
          </Button>
        </>
      ),
    },
  ];

  const handleStage = async (productId: string) => {
    await doRequest(() => transferStageProduct(productId), 'Product commited.');
  };

  const handleUploadToShopify = async (productId: string) => {
    const response: any = await doRequest(() => exportToShopifyProduct(productId),'',true);
    if (response.success) message.success(response.message);
    else message.error('Error: ' + response.error);
  };

  useMount(() => {
    scrollIntoView(
      document.querySelector(
        `.scrollable-row-${lastViewedIndex}`
      ) as HTMLElement
    );
  });

  const onSelectChange = (selectedRowKeys: any, selectedRows: any) => {
    setSelectedRowKeys(selectedRowKeys);
    setSelectedRows(selectedRows);
  };

  return (
    <Form
      form={form}
      name="productForm"
      onFinish={onFormFinish}
      onFinishFailed={({ errorFields }) => {
        errorFields.forEach(errorField => {
          message.error('Error: ' + errorField.errors[0]);
        });
      }}
    >
      <div className="preview custom-table">
        <InfiniteScroll
          height="30rem"
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
            loadedRef.current && (
              <div className="scroll-message">
                <b>End of results.</b>
              </div>
            )
          }
        >
          <EditableTable
            scroll={{ x: true }}
            rowClassName={(_, index) =>
              `scrollable-row-${index} ${
                index === lastViewedIndex ? 'selected-row' : ''
              }`
            }
            rowKey="id"
            columns={columns}
            dataSource={_products}
            loading={loading || disabled}
            onSave={onSaveProduct}
            pagination={false}
            rowSelection={{
              selectedRowKeys,
              onChange: onSelectChange,
            }}
            btnStyle={btnStyle}
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
      </div>
    </Form>
  );
};

export default AlternatePreviewProducts;
