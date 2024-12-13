import { useState } from "react";
import { Box, Typography, IconButton, Tooltip } from "@mui/material";
import { HelpOutline as HelpOutlineIcon } from "@mui/icons-material";
import { FormattedMultiTextField } from "../forms";
import { GetAllTags } from "../apiFolder/DatasetSearchAPI";

export const DatasetTags = (props) => {
    const [disabled, setDisabled] = useState(false);

    const setValid = (val) => {
        if (!disabled) {
          if (!val) {
            setDisabled(true);
          }
        } else if (val) {
          const errors = document.querySelectorAll("p.Mui-error");
          if (errors.length === 0) {
            setDisabled(false);
          }
        }
    }

    return <>
        <Box sx={{ padding: 2 }}>
            <Typography variant="h5" align="center" gutterBottom>
                Tags
                <Tooltip title="Tags are used to discover datasets.">
                    <IconButton size="small">
                        <HelpOutlineIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            </Typography>
            <FormattedMultiTextField
                id="Tag"
                label="Tag"
                variant="filled"
                fullWidth
                sx={{ background: 'rgb(255, 255, 255)' }}
                words={props.tags}
                setWords={props.setTags}
                setValid={setValid}
                maxChars={25}
                getOptions={GetAllTags}
            />
        </Box>
    </>
}