import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Button, PageHeader, Popconfirm, Table } from "antd";
import { ColumnsType } from "antd/lib/table";
import { PromoCode } from "interfaces/PromoCode";
import moment from "moment";
import { useEffect, useState } from "react";
import { RouteComponentProps } from "react-router";
import { Link } from "react-router-dom";
import { deletePromoCode, fetchPromoCodes } from "services/DiscoClubService";

const PromoCodes: React.FC<RouteComponentProps> = ({ history }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);

  const deleteItem = async (id: string) => {
    setLoading(true);
    try {
      await deletePromoCode({ id });
      fetch();
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  const fetch = async () => {
    setLoading(true);
    const response: any = await fetchPromoCodes();
    setLoading(false);
    setPromoCodes(response.results);
  };

  useEffect(() => {
    fetch();
  }, []);

  const columns: ColumnsType<PromoCode> = [
    {
      title: "Code",
      dataIndex: "code",
      width: "30%",
      render: (value: string, record: PromoCode) => (
        <Link to={{ pathname: `promo-code`, state: record }}>{value}</Link>
      ),
    },
    {
      title: "Dollars",
      dataIndex: "dollars",
      width: "10%",
      align: "center",
    },
    {
      title: "Discount",
      dataIndex: "discount",
      width: "10%",
      align: "center",
    },
    {
      title: "Creation",
      dataIndex: "hCreationDate",
      width: "15%",
      align: "center",
      render: (value: Date) => (
        <>
          <div>{moment(value).format("DD/MM/YYYY")}</div>
          <div>{moment(value).format("HH:mm")}</div>
        </>
      ),
    },
    {
      title: "actions",
      key: "action",
      width: "10%",
      align: "right",
      render: (_, record: PromoCode) => (
        <>
          <Link to={{ pathname: `promo-code`, state: record }}>
            <EditOutlined />
          </Link>
          <Popconfirm
            title="Are you sure？"
            okText="Yes"
            cancelText="No"
            onConfirm={() => deleteItem(record.id)}
          >
            <Button type="link" style={{ padding: 0, margin: 6 }}>
              <DeleteOutlined />
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="PromoCodes"
        subTitle="List of PromoCodes"
        extra={[
          <Button key="1" onClick={() => history.push("promo-code")}>
            New Item
          </Button>,
        ]}
      />
      <Table
        rowKey="id"
        columns={columns}
        dataSource={promoCodes}
        loading={loading}
      />
    </div>
  );
};

export default PromoCodes;
