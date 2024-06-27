import { Box, IconButton, Chip } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import { FormattedTextField } from "./FormattedTextField";
import { useState } from "react";

export const FormattedMultiTextField = (props) => {
    const [word, setWord] = useState("");

    const addWord = () => {
        if (word.trim() === "") return;
        let _words = [...props.words];
        _words.push(word);
        props.setWords(_words);
        setWord('');
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

    return <>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
                <FormattedTextField
                    { ...props }
                    value={word}
                    setValue={setWord}
                    onKeyDown = {onEnter}
                />
                <IconButton onClick={() => addWord()} disabled={props.disabled}>
                    <AddIcon />
                </IconButton>
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