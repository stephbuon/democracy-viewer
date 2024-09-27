import { useState, useEffect, useRef } from 'react';
import ReactSelect from 'react-select';
import { FixedSizeList } from 'react-window';

export const FormattedMultiSelectField = (props) => {
  const [options, setOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchOptions = async (search = '', page = 1) => {
    setIsLoading(true);
    try {
      if (typeof props.getData === "function") {
        const data = await props.getData({ search, page });
        const fetchedOptions = data.map(item => {
          if (typeof item === "object") {
            return item;
          } else {
            return {
              value: item,
              label: item
            }
          }
        });
  
        if (fetchedOptions.length === 0) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }

        setOptions(prevOptions => [...prevOptions, ...fetchedOptions]);
      } else {
        const data = props.getData.map(item => {
          if (typeof item === "object") {
            return item;
          } else {
            return {
              value: item,
              label: item
            }
          }
        });
        setOptions(data);
        setHasMore(false);
      }      
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const fetchMoreData = () => {
    fetchOptions(inputValue, page + 1);
    setPage(page + 1);
  }

  useEffect(() => {
    if (!props.isDisabled) {
      setOptions([]);
      setPage(1);
      setHasMore(true);
      if (inputValue) {
        fetchOptions(inputValue);
      } else {
        fetchOptions();
      }
    }
  }, [inputValue, props.isDisabled, props.refresh]);

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
              hasMore={hasMore}
              fetchMoreData={fetchMoreData}
              page={page}
            />
          ),
        }}
        isLoading={isLoading}
      />
    </div>
  );
}

const MenuList = ({ children, fetchMoreData, hasMore, isLoading, page }) => {
  const height = 50;
  const listRef = useRef(null);

  const onScroll = ({ scrollDirection, scrollOffset }) => {
    if (hasMore && !isLoading) {
      const totalHeight = children.length * height;
      const clientHeight = Math.min(children.length, 3) * height;
      // Check if the user has scrolled near the bottom
      if (scrollDirection === 'forward' && totalHeight - scrollOffset <= clientHeight + 10) {
        fetchMoreData();  // Trigger loading more options when near the bottom
      }
    }
  };

  useEffect(() => {
    const index = (page - 1) * 10;
    if (!isLoading && index > 0) {
      listRef.current.scrollToItem(index);
    }
  }, [isLoading]);

  return (
    <FixedSizeList
      height={Math.min(children.length, 3) * height}
      itemCount={children.length}
      itemSize={height}
      onScroll={onScroll}
      ref={listRef}
    >
      {({ index, style }) => <div style={style}>{children[index]}</div>}
    </FixedSizeList>
  );
};