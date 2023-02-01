import {
    PageHeader,
    Button

} from 'antd';
import { Creator } from 'interfaces/Creator';
import CreatorsMultipleFetchDebounceSelect from 'pages/creators/components/CreatorsMultipleFetchDebounceSelect';
import { useState } from 'react';

interface DevelopmentDetailProps {

}

const DevelopmentDetail: React.FC<DevelopmentDetailProps> = ({


}) => {
    const [creatorFilter, setCreatorFilter] = useState<Creator>();

    return (
        <>
            <PageHeader
                title={'Development page for testing'}
            />

            <CreatorsMultipleFetchDebounceSelect
              onChangeCreator={(_, creator) => setCreatorFilter(creator)}
            />

            <h1>{creatorFilter?.firstName}</h1>
            <Button
                key="1"
                className='mt-05'
                onClick={() => {
                    console.log(creatorFilter);
                    
                }}
            >
                Console Log
            </Button>

           
        </>
    );
};

export default DevelopmentDetail;
