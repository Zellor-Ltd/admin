import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Button, PageHeader, Popconfirm, Table } from "antd";
import { ColumnsType } from "antd/lib/table";
import useFilter from "hooks/useFilter";
import { useRequest } from "hooks/useRequest";
import { PromoDisplay } from "interfaces/PromoDisplay";
import moment from "moment";
import { useEffect, useState } from "react";
import { RouteComponentProps } from "react-router";
import { Link } from "react-router-dom";
import {
  deletePromoDisplay,
  fetchPromoDisplays,
} from "services/DiscoClubService";

const PromoDisplays: React.FC<RouteComponentProps> = ({ history }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const { doFetch, doRequest } = useRequest({ setLoading });

  const {
    setArrayList: setPromoDisplays,
    filteredArrayList: filteredPromoDisplays,
  } = useFilter<PromoDisplay>([]);

  const getResources = async () => {
    await getPromoDisplays();
  };

  const getPromoDisplays = async () => {
    const { results } = await doFetch(fetchPromoDisplays);
    setPromoDisplays(results);
  };

  useEffect(() => {
    getResources();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const deleteItem = async (id: string) => {
    await doRequest(() => deletePromoDisplay({ id }));
    await getPromoDisplays();
  };

  const columns: ColumnsType<PromoDisplay> = [
    {
      title: "Shop Display ID",
      dataIndex: "id",
      width: "20%",
      render: (value: string, record: PromoDisplay) => (
        <Link to={{ pathname: `promo-display`, state: record }}>{value}</Link>
      ),
    },
    {
      title: "Display Start Date",
      dataIndex: "displayStartDate",
      width: "15%",
      align: "center",
      render: (value: Date) => (
        <>
          <div>{moment(value).format("DD/MM/YYYY")}</div>
        </>
      ),
    },
    {
      title: "Display Expire Date",
      dataIndex: "displayExpireDate",
      width: "15%",
      align: "center",
      render: (value: Date) => (
        <>
          <div>{moment(value).format("DD/MM/YYYY")}</div>
        </>
      ),
    },
    {
      title: "Actions",
      key: "action",
      width: "10%",
      align: "right",
      render: (_, record: PromoDisplay) => (
        <>
          <Link to={{ pathname: `promo-display`, state: record }}>
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
        title="Shop Display"
        subTitle="List of Shop Display"
        extra={[
          <Button key="1" onClick={() => history.push("promo-display")}>
            New Item
          </Button>,
        ]}
      />
      <Table
        rowKey="id"
        columns={columns}
        dataSource={filteredPromoDisplays}
        loading={loading}
      />
    </div>
  );
};

export default PromoDisplays;
