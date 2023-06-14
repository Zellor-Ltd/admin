/* eslint-disable react-hooks/exhaustive-deps */
import { Button, Col, Table, PageHeader, Row, Typography, Tooltip } from 'antd';
import { useState, useEffect } from 'react';
import React from 'react';
import { useRequest } from 'hooks/useRequest';
import { fetchCommissionDetails } from 'services/DiscoClubService';
import { ColumnType } from 'antd/lib/table';
import CopyValueToClipboard from 'components/CopyValueToClipboard';
import { Product } from 'interfaces/Product';

interface CommissionDetailProps {
  setDetails: (bool: boolean) => void;
  commission?: any;
}

const CommissionDetail: React.FC<CommissionDetailProps> = ({
  setDetails,
  commission,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [products, setProducts] = useState<Product[]>([]);
  const { doFetch } = useRequest({ setLoading });
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [totalSalePrice, setTotalSalePrice] = useState<number>(0);
  const [tempAmount, setTempAmount] = useState<number>(0);
  const [tempSalePrice, setTempSalePrice] = useState<number>(0);

  useEffect(() => {
    getDetails();
  }, []);

  useEffect(() => {
    setTotalAmount(tempAmount);
    setTotalSalePrice(tempSalePrice);
  }, [tempAmount, tempSalePrice]);

  const getDetails = async () => {
    const { results } = await doFetch(() =>
      fetchCommissionDetails(commission.id)
    );
    setProducts(results);
  };

  const columns: ColumnType<Product>[] = [
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
            <Tooltip title="Product ID">Product ID</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'id',
      width: '1%',
      render: id => (
        <CopyValueToClipboard tooltipText="Copy Product ID" value={id} />
      ),
      align: 'center',
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
            <Tooltip title="Product Description">Product Description</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'description',
      width: '10%',
      align: 'center',
      responsive: ['sm'],
      shouldCellUpdate: (prevRecord, nextRecord) =>
        prevRecord.description !== nextRecord.description,
      sorter: (a, b): any => {
        if (a.description && b.description)
          return a.description.localeCompare(b.description);
        else if (a.description) return -1;
        else if (b.description) return 1;
        else return 0;
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
            <Tooltip title="Price">Price</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'originalPrice',
      width: '10%',
      sorter: (a, b): any => {
        if (a.originalPrice && b.originalPrice)
          return a.originalPrice - b.originalPrice;
        else if (a.originalPrice) return -1;
        else if (b.originalPrice) return 1;
        else return 0;
      },
      render: (value: number) => `€${value}`,
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
            <Tooltip title="Discount">Discount</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'originalPrice',
      width: '10%',
      sorter: (a, b): any => {
        if (a.originalPrice && b.originalPrice)
          return a.originalPrice - b.originalPrice;
        else if (a.originalPrice) return -1;
        else if (b.originalPrice) return 1;
        else return 0;
      },
      render: (_: number, entity: Product) =>
        `${
          ((entity.discountedPrice - entity.originalPrice) * 100) /
          entity.originalPrice
        }%`,
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
            <Tooltip title="Sale Price">Sale Price</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'discountedPrice',
      width: '10%',
      sorter: (a, b): any => {
        if (a.discountedPrice && b.discountedPrice)
          return a.discountedPrice - b.discountedPrice;
        else if (a.discountedPrice) return -1;
        else if (b.discountedPrice) return 1;
        else return 0;
      },
      render: (value: number) => `€${value}`,
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
            <Tooltip title="Commission %">Commission %</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'creatorPercentage',
      width: '10%',
      sorter: (a, b): any => {
        if (a.creatorPercentage && b.creatorPercentage)
          return a.creatorPercentage - b.creatorPercentage;
        else if (a.creatorPercentage) return -1;
        else if (b.creatorPercentage) return 1;
        else return 0;
      },
      render: (value: number) => `${value}%`,
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
            <Tooltip title="Commission Amount">Commission Amount</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'creatorPercentage',
      width: '10%',
      sorter: (a, b): any => {
        if (a.creatorPercentage && b.creatorPercentage)
          return a.creatorPercentage - b.creatorPercentage;
        else if (a.creatorPercentage) return -1;
        else if (b.creatorPercentage) return 1;
        else return 0;
      },
      render: (value: number, entity: Product) =>
        value ? `€${(value / 100) * entity.originalPrice}` : '-',
    },
  ];

  return (
    <>
      <PageHeader title="Commission Details" />
      <Row gutter={[8, 8]}>
        <Col span={24}>
          <Table
            rowKey="id"
            columns={columns}
            dataSource={products}
            loading={loading}
            pagination={false}
            summary={pageData => {
              pageData.forEach(
                ({ discountedPrice, creatorPercentage, originalPrice }) => {
                  setTempAmount(
                    prev =>
                      prev + ((creatorPercentage ?? 0) / 100) * originalPrice
                  );
                  setTempSalePrice(prev => prev + discountedPrice);
                }
              );

              return (
                <>
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0}>
                      <Typography.Text strong>Total</Typography.Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1}></Table.Summary.Cell>
                    <Table.Summary.Cell index={2}></Table.Summary.Cell>
                    <Table.Summary.Cell index={3}></Table.Summary.Cell>
                    <Table.Summary.Cell index={4}>
                      €{totalSalePrice?.toFixed(2)}
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={5}></Table.Summary.Cell>
                    <Table.Summary.Cell index={6}>
                      €{totalAmount?.toFixed(2)}
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                </>
              );
            }}
          />
        </Col>
        <Col>
          <Button
            type="default"
            onClick={() => setDetails(false)}
            className="mt-1"
          >
            Return
          </Button>
        </Col>
      </Row>
    </>
  );
};

export default CommissionDetail;
