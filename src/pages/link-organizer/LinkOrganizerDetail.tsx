import { Button, Col, Row, Tooltip } from "antd";
import { ColumnsType } from "antd/lib/table";
import { SortableTable } from "components";
import { useRequest } from "hooks/useRequest";
import { useState } from "react";

interface LinkOrganizerDetailProps {
    record: any;
    onSave: (record: any, setLoading: any) => void;
    onCancel: () => void;
}

const LinkOrganizerDetail: React.FC<LinkOrganizerDetailProps> = ({
    record,
    onSave,
    onCancel
}) => {
    const [loading, setLoading] = useState(false)
    const { doFetch } = useRequest({ setLoading });
    const [links, setLinks] = useState<any[]>(record.links);

    const onSaveData = async () => {

        let newRecord = record;
        newRecord.links = links;
        let orderCount = 0
        newRecord.links.forEach(item => {
            item.lIndex = orderCount;
            orderCount++;
        });
         onSave(newRecord,setLoading)        
    }

    const columns: ColumnsType<any> = [
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
                        <Tooltip title="Link">Link</Tooltip>
                    </div>
                </div>
            ),
            dataIndex: 'id',
            width: '10%',
            render: id => (
                <a href={'https://beautybuzz.io/' + id.replace('_STR', '')} target="blank">
                    {id.replace('_STR', '')}
                </a>
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
                        <Tooltip title="Creator">Creator</Tooltip>
                    </div>
                </div>
            ),
            dataIndex: 'feed',
            width: '10%',
            render: (feed: any) => (
                feed?.creator?.firstName
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
                        <Tooltip title="Product Brand">Product Brand</Tooltip>
                    </div>
                </div>
            ),
            dataIndex: 'productBrand',
            width: '20%',
            render: (productBrand: any) => (
                productBrand?.name
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
                        <Tooltip title="Brand">Brand</Tooltip>
                    </div>
                </div>
            ),
            dataIndex: 'brand',
            width: '20%',
            render: (brand: any) => (
                brand?.name
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
                        <Tooltip title="Description">Description</Tooltip>
                    </div>
                </div>
            ),
            dataIndex: 'feed',
            width: '30%',
            render: (feed: any) => (
                feed?.shortDescription
            ),
            align: 'center',
        },
    ];

    return (
        <>
            <Row>
                <Col flex="auto">Reorder links below</Col>
                <Col flex="100px">
                    <Button
                        disabled={loading}
                        loading={loading}
                        type="primary"
                        className="mb-1"
                        onClick={() => onSaveData()}
                    >
                        Save Changes
                    </Button>
                </Col>
                <Col flex="100px">
                    <Button 
                        type="default" 
                        onClick={() => onCancel()}>
                        Cancel
                    </Button>
                </Col>
            </Row>
            <Row>
                <Col span={24}>
                    <SortableTable
                        scroll={{ x: true, y: '34em' }}
                        rowKey="id"
                        columns={columns}
                        dataSource={links}
                        setDataSource={setLinks}
                        loading={loading}
                    />
                </Col>
            </Row>
        </>
    );
};

export default LinkOrganizerDetail;