import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Button, PageHeader, Popconfirm, Spin, Table } from "antd";
import { ColumnsType } from "antd/lib/table";
import { PromoCode } from "interfaces/PromoCode";
import moment from "moment";
import { useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { RouteComponentProps } from "react-router";
import { Link } from "react-router-dom";
import { deletePromoCode, fetchPromoCodes } from "services/DiscoClubService";
import "./PromoCodes.scss";

const PromoCodes: React.FC<RouteComponentProps> = ({ history }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);

  const fetch = async () => {
    setLoading(true);
    const response: any = await fetchPromoCodes();
    setLoading(false);
    setPromoCodes(response.results);
  };

  const deleteItem = async (id: string) => {
    setLoading(true);
    await deletePromoCode({ id });
    fetch();
  };

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
      title: "Actions",
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

  const [fetchedPromoCodes, setFetchedPromoCodes] = useState<any[]>([]);
  const [page, setPage] = useState<number>(0);
  const LIMIT = 10;

  const fetchData = () => {
    const setNewData = () => {
      setFetchedPromoCodes((prev) => [
        ...prev.concat(promoCodes.slice(page * LIMIT, page * LIMIT + LIMIT)),
      ]);
      setPage((prev) => prev + 1);
    };
    if (!promoCodes.length) {
      return;
    }
    if (!fetchedPromoCodes.length) {
      setNewData();
      return;
    }
    setTimeout(setNewData, 1000);
  };

  useEffect(() => {
    fetch();
  }, []);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [promoCodes]);

  return (
    <div className="promo-codes">
      <PageHeader
        title="PromoCodes"
        subTitle="List of PromoCodes"
        extra={[
          <Button key="1" onClick={() => history.push("promo-code")}>
            New Item
          </Button>,
        ]}
      />
      <InfiniteScroll
        dataLength={fetchedPromoCodes.length}
        next={fetchData}
        hasMore={loading || fetchedPromoCodes.length !== promoCodes.length}
        loader={
          !loading && (
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
        <Table
          rowKey="id"
          pagination={false}
          columns={columns}
          dataSource={fetchedPromoCodes}
          loading={loading}
        />
      </InfiniteScroll>
    </div>
  );
};

export default PromoCodes;
