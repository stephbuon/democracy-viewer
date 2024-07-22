import { useState, useEffect } from 'react';
import ReactSelect from 'react-select';
import { FixedSizeList } from 'react-window';

export const FormattedMultiSelectField = (props) => {
  const [options, setOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const fetchOptions = async (search = '') => {
    setIsLoading(true);
    try {
      const data = await props.getData({ search });
      const fetchedOptions = data.map(item => ({
        value: item,
        label: item
      }));
      setOptions(fetchedOptions);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (!props.isDisabled) {
      if (inputValue) {
        fetchOptions(inputValue);
      } else {
        fetchOptions();
      }
    }
  }, [inputValue, props.isDisabled]);

  return (
    <div style={{ margin: '20px 0' }}>
      <ReactSelect
        { ...props }
        isMulti
        value={props.selectedOptions}
        onChange={x => props.setSelectedOptions(x)}
        onInputChange={x => setInputValue(x)}
        options={options}
        components={{
          MenuList: (props) => (
            <MenuList
              {...props}
              setLoading={setIsLoading}
              fetchMoreData={() => fetchOptions(inputValue)}
            />
          ),
        }}
        isLoading={isLoading}
      />
    </div>
  );
}

const MenuList = (props) => {
  const height = 50;

  return (
    <FixedSizeList
      height={Math.min(props.children.length, 3) * height}
      itemCount={props.children.length}
      itemSize={height}
    >
      {({ index, style }) => <div style={style}>{props.children[index]}</div>}
    </FixedSizeList>
  );
};