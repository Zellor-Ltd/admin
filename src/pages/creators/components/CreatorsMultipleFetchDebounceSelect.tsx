import MultipleFetchDebounceSelect from 'components/select/MultipleFetchDebounceSelect';
import { useRequest } from 'hooks/useRequest';
import { Creator } from 'interfaces/Creator';
import { SelectOption } from 'interfaces/SelectOption';
import { useState } from 'react';
import { fetchCreators } from 'services/DiscoClubService';

interface CreatorsMultipleFetchDebounceSelectProps {
    onChangeCreator?: (value?: string, entity?: any) => void;
    input?: string;
    onClear?: Function;
    disabled?: boolean;
}

const CreatorsMultipleFetchDebounceSelect: React.FC<CreatorsMultipleFetchDebounceSelectProps> = ({
    onChangeCreator,
    input,
    onClear,
    disabled
}) => {

    const [optionsPage, setOptionsPage] = useState<number>(0);
    const { doFetch } = useRequest();
    const [creators, setcreators] = useState<Creator[]>([]);

    const optionMapping: SelectOption = {
        key: 'id',
        value: 'id',
        label: 'firstName',
    };
    
    const getCreators = async (input?: string, loadNextPage?: boolean) => {

        if (!input) {
            return []
        }
        const pageToUse = !!!loadNextPage ? 0 : optionsPage;
        const response = await doFetch(() =>
            fetchCreators({
                page: pageToUse,
                query: input,
            })
        );
        setOptionsPage(pageToUse + 1);

        if (pageToUse === 0) setcreators(response.results);
        else setcreators(prev => [...prev.concat(response.results)]);

        return response.results;
    };

    const handleCreatorChange = (value?: string) => {
        const entity = creators.find(item => item.id === value);
        onChangeCreator?.(value,entity)
    };

    return (
        <>
            <MultipleFetchDebounceSelect
                style={{ width: '100%' }}
                onInput={getCreators}
                onChange={(value: any) => handleCreatorChange(value)}
                onClear={onClear}
                optionMapping={optionMapping}
                placeholder="Select a Creator"
                disabled={disabled}
                input={input}
                options={creators}
                loadOnClick={false}
            />
        </>
    );
};

export default CreatorsMultipleFetchDebounceSelect;
