import { Box, IconButton, Chip, List, ListItem, ListItemButton, ListItemText } from "@mui/material";
import { Add as AddIcon } from '@mui/icons-material';
import { FormattedTextField } from "./FormattedTextField";
import { useState } from "react";

export const FormattedMultiTextField = (props) => {
    const [word, setWord] = useState("");
    const [filteredOptions, setFilteredOptions] = useState([]);
    const [isFocused, setIsFocused] = useState(false);

    const addWord = (selectedWord = null) => {
        let currWord;
        if (typeof selectedWord === "string") {
            currWord = selectedWord;
        } else {
            currWord = word;
        }

        if (currWord.trim() === "") return;
        let _words = [...props.words];
        _words.push(currWord);
        props.setWords(_words);
        setWord('');
        setFilteredOptions(filteredOptions.filter(x => x.toLowerCase() !== currWord.toLowerCase()));
    }

    const deleteWord = (_word) => {
        let _words = props.words;
        let index = _words.indexOf(_word);
        if (index > -1) {
            _words.splice(index, 1);
        }
        props.setWords([..._words]);
    }

    const onEnter = (event) => {
        if (event.key === "Enter") {
            addWord();
        }
    }

    const onInputChange = async(value) => {
        setWord(value);
        if (props.getOptions) {
            // Filter options from the props list that match the input
            const options = await props.getOptions({ search: value, page: 1 });
            setFilteredOptions(options.filter(x => !props.words.includes(x)));
        }
    }

    const handleFocus = () => {
        setIsFocused(true);
    }

    const handleBlur = () => {
        // Hide the dropdown after a slight delay to allow for option clicks
        setTimeout(() => setIsFocused(false), 200);
    }

    return <>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Box sx={{ display: 'flex', gap: 1, position: "relative" }}>
                <FormattedTextField
                    { ...props }
                    value={word}
                    setValue={onInputChange}
                    onKeyDown = {onEnter}
                    onFocus={handleFocus}      // Show options when focused
                    onBlur={handleBlur}        // Hide options when not focused
                />
                <IconButton onClick={() => addWord()} disabled={props.disabled}>
                    <AddIcon />
                </IconButton>

                {/* List of filtered options shown when typing and field is focused */}
                {filteredOptions.length > 0 && isFocused && (
                    <List 
                        sx={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            width: '100%',
                            maxHeight: 150,
                            overflowY: 'auto',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            backgroundColor: 'white',
                            zIndex: 100,  // Ensure it appears above other content
                        }}
                    >
                        {filteredOptions.map((option, index) => (
                            <ListItem key={index} disablePadding>
                                <ListItemButton onClick={() => addWord(option)}>
                                    <ListItemText primary={option} />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                )}
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {props.words.map((word, index) => (
                    <Chip
                        key={index}
                        label={word}
                        onDelete={() => deleteWord(word)}
                        sx={{ margin: 0.5 }}
                    />
                ))}
            </Box>
        </Box>
    </>
}