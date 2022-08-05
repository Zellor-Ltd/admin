import { Button, Col, Table, PageHeader, Row, Typography } from 'antd';
import { useState, useEffect } from 'react';
import React from 'react';
import { useRequest } from 'hooks/useRequest';
import { fetchCommissionDetails } from 'services/DiscoClubService';
import { ColumnType } from 'antd/lib/table';
import CopyIdToClipboard from 'components/CopyIdToClipboard';
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

  useEffect(() => {
    getDetails();
  }, []);

  const getDetails = async () => {
    const { results } = await doFetch(() =>
      fetchCommissionDetails(commission.id)
    );
    setProducts(results);
  };

  const columns: ColumnType<Product>[] = [
    {
      title: 'Product Id',
      dataIndex: 'id',
      width: '1%',
      render: id => <CopyIdToClipboard id={id} />,
      align: 'center',
    },
    {
      title: 'Product Description',
      dataIndex: 'description',
      width: '10%',
      align: 'center',
      responsive: ['sm'],
      shouldCellUpdate: (prevRecord, nextRecord) =>
        prevRecord.description != nextRecord.description,
      sorter: (a, b): any => {
        if (a.description && b.description)
          return a.description.localeCompare(b.description);
        else if (a.description) return -1;
        else if (b.description) return 1;
        else return 0;
      },
    },
    {
      title: 'Price',
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
      title: 'Discount',
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
      title: 'Sale Price',
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
      title: 'Commission %',
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
      title: 'Commission Amount',
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
              let tempAmount,
                tempSalePrice = 0;
              pageData.forEach(
                ({ discountedPrice, creatorPercentage, originalPrice }) => {
                  tempAmount +=
                    ((creatorPercentage ?? 0) / 100) * originalPrice;
                  tempSalePrice += discountedPrice;
                }
              );
              setTotalAmount(tempAmount);
              setTotalSalePrice(tempSalePrice);

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
