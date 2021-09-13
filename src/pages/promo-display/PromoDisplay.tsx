import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Button, Col, PageHeader, Popconfirm, Row, Table } from "antd";
import { ColumnsType } from "antd/lib/table";
import { SearchFilter } from "components/SearchFilter";
import useFilter from "hooks/useFilter";
import { useRequest } from "hooks/useRequest";
import { PromoDisplay } from "interfaces/PromoDisplay";
import moment from "moment";
import { useEffect, useState } from "react";
import { Link, RouteComponentProps } from "react-router-dom";
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
    addFilterFunction,
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

  const searchFilterFunction = (filterText: string) => {
    addFilterFunction("promoId", (promoDisplays) =>
      promoDisplays.filter((promoDisplay) =>
        promoDisplay.id.toUpperCase().includes(filterText.toUpperCase())
      )
    );
  };

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
      <Row gutter={8}>
        <Col lg={8} xs={16}>
          <SearchFilter
            filterFunction={searchFilterFunction}
            label="Search by ID"
          />
        </Col>
      </Row>
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
