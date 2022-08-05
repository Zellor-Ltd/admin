import { Upload } from 'components';
import {
  Button,
  Form,
  Input,
  message,
  Popover,
  Select,
  Spin,
  Tooltip,
} from 'antd';
import EditableTable, {
  EditableColumnType,
} from '../../components/EditableTable';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useRequest } from '../../hooks/useRequest';
import { Product } from '../../interfaces/Product';
import React, { useEffect, useRef, useState } from 'react';
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
import { useSelector } from 'react-redux';
import { SketchPicker } from 'react-color';

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
  disabled: boolean;
  selectedRowKeys: any[];
  setSelectedRowKeys: (keys: string[]) => void;
  setSelectedRows: (rows: Product[]) => void;
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
  disabled,
  selectedRowKeys,
  setSelectedRowKeys,
  setSelectedRows,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);
  const [_products, _setProducts] = useState<Product[]>([]);
  const currentProduct = useRef<Product>();
  const viewPicker = useRef<boolean>(false);

  const {
    settings: { size = [] },
  } = useSelector((state: any) => state.settings);

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

  const handleColourFocus = (product: Product) => {
    viewPicker.current = true;
    currentProduct.current = product;
  };

  const handleColourChange = (value: string, product: Product) => {
    product.colour = value;
  };

  const columns: EditableColumnType<Product>[] = [
    {
      title: 'Id',
      dataIndex: 'id',
      width: '5%',
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
      width: '10%',
      align: 'center',
      render: (_, record) => (
        <Form.Item style={{ marginBottom: '-5px' }}>
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
      width: '10%',
      align: 'center',
      render: (_, record) => (
        <div className="images-content">
          <Form.Item style={{ marginBottom: '-5px' }}>
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
      width: '23%',
      align: 'left',
      ellipsis: true,
      render: (_, record) => {
        return (
          <div className="images-wrapper">
            <div className="images-content">
              <Form.Item style={{ marginBottom: '-5px' }}>
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
      title: 'Colour',
      dataIndex: 'colour',
      width: '10%',
      render: (value: string, record: Product) => (
        <div
          className="grid-color"
          style={{
            background:
              record.id === currentProduct.current?.id
                ? currentProduct.current?.colour
                : record.colour ?? '#FFFFFF',
          }}
        >
          <Tooltip
            placement="topLeft"
            title={
              record.id === currentProduct.current?.id
                ? currentProduct.current?.colour
                : record.colour ?? '#FFFFFF'
            }
          >
            <Popover
              placement="bottomLeft"
              content={
                viewPicker && (
                  <div onBlur={() => (viewPicker.current = false)}>
                    <SketchPicker
                      className="mt-1"
                      color={record.colour ?? '#FFFFFF'}
                      disableAlpha
                      onChangeComplete={selectedColour =>
                        handleColourChange(selectedColour.hex, record)
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
                onClick={() => handleColourFocus(record)}
                ghost
                block
                style={{
                  height: '100%',
                  color:
                    record.id === currentProduct.current?.id
                      ? currentProduct.current?.colour
                      : record.colour ?? '#FFFFFF',
                }}
              >
                {record.id === currentProduct.current?.id
                  ? currentProduct.current?.colour
                  : record.colour ?? '#FFFFFF'}
              </Button>
            </Popover>
          </Tooltip>
        </div>
      ),
    },
    {
      title: 'Colour Title',
      dataIndex: 'colourTitle',
      width: '10%',
      render: (value: string, record: Product) => (
        <Tooltip
          placement="topLeft"
          title={record.colourTitle}
          className="repositioned-grid-item"
        >
          <Input
            onChange={event => (record.colourTitle = event.target.value)}
            placeholder="Colour name"
            defaultValue={value}
          />
        </Tooltip>
      ),
    },
    {
      title: 'Size',
      dataIndex: 'size',
      width: '10%',
      render: (value: string, record: Product) => (
        <Tooltip
          placement="topLeft"
          title={record.size}
          className="repositioned-grid-item"
        >
          <Select
            onChange={optionValue => (record.size = optionValue)}
            placeholder="Size"
            allowClear
            showSearch
            defaultValue={value}
            style={{ width: '100%' }}
            filterOption={(input, option) =>
              !!option?.children
                ?.toString()
                ?.toUpperCase()
                .includes(input?.toUpperCase())
            }
          >
            {size.map((curr: any) => (
              <Select.Option key={curr.value} value={curr.value}>
                {curr.name}
              </Select.Option>
            ))}
          </Select>
        </Tooltip>
      ),
    },
    {
      title: 'Actions',
      key: 'action',
      width: '12%',
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
          loading={loading || disabled}
          onSave={onSaveProduct}
          pagination={false}
          rowSelection={{
            selectedRowKeys,
            onChange: onSelectChange,
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
