import {
  CalendarOutlined,
  DeleteOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { Button, DatePicker, PageHeader, Popconfirm, Table } from "antd";
import { ColumnsType } from "antd/lib/table";
import useFilter from "hooks/useFilter";
import { useRequest } from "hooks/useRequest";
import { Promotion, PromotionWithStatusList } from "interfaces/Promotion";
import moment from "moment";
import { useCallback, useEffect, useState } from "react";
import { RouteComponentProps } from "react-router";
import { Link } from "react-router-dom";
import {
  deletePromotion,
  fetchPromoStatus,
  fetchPromotions,
} from "services/DiscoClubService";

const Promotions: React.FC<RouteComponentProps> = ({ history }) => {
  const [tableloading, setTableLoading] = useState<boolean>(false);
  const { doRequest, doFetch } = useRequest({ setLoading: setTableLoading });
  const [promoStatusList, setPromoStatusList] = useState<any>();
  const [promotionUpdateList, setPromotionUpdateList] = useState<boolean[]>([]);

  const {
    arrayList: promotions,
    setArrayList: setPromotions,
    filteredArrayList: filteredPromotions,
    addFilterFunction,
    removeFilterFunction,
  } = useFilter<Promotion>([]);

  const handleDateChange = (values: any) => {
    if (!values) {
      removeFilterFunction("creationDate");
      return;
    }
    const startDate = moment(values[0], "DD/MM/YYYY").startOf("day").utc();
    const endDate = moment(values[1], "DD/MM/YYYY").endOf("day").utc();
    addFilterFunction("creationDate", (promotions: Promotion[]) =>
      promotions.filter(({ hCreationDate }) => {
        return moment(hCreationDate).utc().isBetween(startDate, endDate);
      })
    );
  };

  const columns: ColumnsType<Promotion> = [
    {
      title: "Promo ID",
      dataIndex: "id",
      width: "10%",
      align: "left",
    },
    {
      title: "Brand",
      dataIndex: ["brand", "brandName"],
      width: "10%",
      align: "center",
    },
    {
      title: "Creation",
      dataIndex: "hCreationDate",
      width: "10%",
      align: "center",
      filterIcon: <CalendarOutlined />,
      filterDropdown: () => (
        <DatePicker.RangePicker
          style={{ padding: 8 }}
          onChange={handleDateChange}
        />
      ),
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
      width: "5%",
      align: "right",
      render: (_, record) => (
        <>
          <Link
            to={{
              pathname: `/promotion`,
              state: {
                ...record,
                promoStatusList: promoStatusList,
              } as PromotionWithStatusList,
            }}
          >
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

  const getPromotions = useCallback(async () => {
    const promoStatus = await doFetch(fetchPromotions);
    setPromotions(promoStatus);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getPromoStatus = useCallback(async () => {
    const results = await doFetch(fetchPromoStatus);
    setPromoStatusList(results[0]?.promoStatus);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getResources = useCallback(async () => {
    await Promise.all([getPromotions(), getPromoStatus()]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const deleteItem = async (id: string) => {
    await doRequest(() => deletePromotion({ id }));
    await getResources();
  };

  useEffect(() => {
    getResources();
  }, [getResources]);

  return (
    <div className="promotions">
      <PageHeader
        title="Promotions"
        subTitle="List of Promotions"
        extra={[
          <Button key="1" onClick={() => history.push("/promotion")}>
            New Item
          </Button>,
        ]}
      />
      <Table
        rowKey="id"
        columns={columns}
        dataSource={filteredPromotions}
        loading={tableloading}
      />
    </div>
  );
};

export default Promotions;
