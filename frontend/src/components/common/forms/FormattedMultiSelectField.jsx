import { useState, useEffect } from 'react';
// import ReactSelect from 'react-select';
import { FormControl, Autocomplete, TextField, InputLabel } from '@mui/material';
// import { FixedSizeList } from 'react-window';

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

          // Ensure no duplicates in options by filtering them out
          setOptions(prevOptions => {
            const uniqueOptions = new Set(prevOptions.map(option => option.value));
            const newOptions = fetchedOptions.filter(option => !uniqueOptions.has(option.value));
            return [...prevOptions, ...newOptions];
          });
        }
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

  useEffect(() => {
    fetchOptions(inputValue, page);
  }, [props.getData]);

  return (
    <FormControl fullWidth variant="filled" sx={{ background: 'rgb(255, 255, 255)' }}>
      <Autocomplete
        multiple
        id="tags-standard"
        options={options}
        getOptionLabel={(option) => option.label}
        value={props.selectedOptions}
        onChange={(event, newValues) => props.setSelectedOptions(newValues)}
        renderInput={(params) => {
          return <>
            <TextField
              {...params}
              label={ props.label }
              placeholder="Search..."
              variant="filled"
            />
          </>
          
        }}
      />
    </FormControl>
  );
}