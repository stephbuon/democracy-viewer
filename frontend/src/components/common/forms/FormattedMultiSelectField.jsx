import { useState, useEffect } from 'react';
// import ReactSelect from 'react-select';
import { FormControl, Autocomplete, TextField, InputLabel, CircularProgress } from '@mui/material';
// import { FixedSizeList } from 'react-window';

export const FormattedMultiSelectField = (props) => {
  const [options, setOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Helper function to detect if a string is a valid date
  const isValidDate = (dateString) => {
    if (typeof dateString !== 'string') return false;
    
    // Common date patterns
    const datePatterns = [
      /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD
      /^\d{2}\/\d{2}\/\d{4}$/, // MM/DD/YYYY
      /^\d{2}-\d{2}-\d{4}$/, // MM-DD-YYYY
      /^\d{4}\/\d{2}\/\d{2}$/, // YYYY/MM/DD
      /^\d{1,2}\/\d{1,2}\/\d{4}$/, // M/D/YYYY or MM/D/YYYY etc
    ];
    
    // Check if it matches common date patterns
    const matchesPattern = datePatterns.some(pattern => pattern.test(dateString.trim()));
    if (!matchesPattern) return false;
    
    // Verify it's actually a valid date
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date) && date.getFullYear() > 1900;
  };

  // Helper function to determine sort type based on data
  const detectSortType = (options) => {
    if (options.length === 0) return 'alphabetical';
    
    // Sample first few options to determine type
    const sampleSize = Math.min(5, options.length);
    const sample = options.slice(0, sampleSize);
    
    // Check if majority of samples are dates
    const dateCount = sample.filter(option => {
      const label = String(option.label || '');
      return isValidDate(label);
    }).length;
    const threshold = Math.ceil(sampleSize * 0.6); // 60% threshold
    
    return dateCount >= threshold ? 'date' : 'alphabetical';
  };

  // Helper function to sort options
  const sortOptions = (options) => {
    if (options.length === 0) return options;
    
    const sortType = detectSortType(options);
    
    return [...options].sort((a, b) => {
      // Ensure labels are strings
      const labelA = String(a.label || '');
      const labelB = String(b.label || '');
      
      if (sortType === 'date') {
        const dateA = new Date(labelA);
        const dateB = new Date(labelB);
        
        // If either date is invalid, fall back to alphabetical
        if (isNaN(dateA) || isNaN(dateB)) {
          return labelA.localeCompare(labelB, undefined, { 
            numeric: true, 
            sensitivity: 'base' 
          });
        }
        
        return dateA - dateB;
      } else {
        // Alphabetical sort with numeric awareness (so "Item 2" comes before "Item 10")
        return labelA.localeCompare(labelB, undefined, { 
          numeric: true, 
          sensitivity: 'base' 
        });
      }
    });
  };

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
            const allOptions = [...prevOptions, ...newOptions];
            
            // Sort the combined options
            return sortOptions(allOptions);
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
        
        // Sort the static data
        setOptions(sortOptions(data));
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const fetchMoreData = () => {
    if (hasMore) {
      fetchOptions(inputValue, page + 1);
      setPage(page + 1);
    }
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
    <FormControl { ...props } fullWidth variant="filled" sx={{ background: 'rgb(255, 255, 255)' }}>
      <Autocomplete
        multiple
        options={options}
        getOptionLabel={(option) => String(option.label || '')}
        value={props.selectedOptions}
        onChange={(event, newValues) => props.setSelectedOptions(newValues)}
        renderInput={(params) => {
          return <>
            <TextField
              {...params}
              label={ props.label }
              placeholder="Search..."
              variant="filled"
              InputProps={{
                ...params.InputProps,
                endAdornment: <>
                  {
                    isLoading === true &&
                    <CircularProgress color = "inherit" size = {20}/>
                  }
                  { params.InputProps.endAdornment }
                </>
              }}
              onChange={event => setInputValue(event.target.value)}
            />
          </>
        }}
        ListboxProps={{
          component: 'div',
          style: { maxHeight: 300, overflow: 'auto' },
          onScroll: (event) => {
              const listboxNode = event.currentTarget;
              if (listboxNode.scrollTop + listboxNode.clientHeight >= listboxNode.scrollHeight) {
                  fetchMoreData();
              }
          },
      }}
      />
    </FormControl>
  );
}