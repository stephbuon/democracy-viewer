import { TextField, FormControl, FormHelperText } from "@mui/material";
import { useEffect, useState } from "react";
import { PatternFormat } from "react-number-format";
import { isNumeric } from "validator";

export const FormattedPatternField = ({ id, label, defaultText, pattern, numeric, disabled, required, setValid, fullWidth }) => {
    const [value, setValue] = useState(defaultText ? defaultText : "");
    const [error, setError] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (required && !value) {
            if (setValid) {
                setValid(id, false);
            }
        } else if (!required && !value) {
            setError(false);
            setMessage("");
            if (setValid) {
                setValid(id, true);
            }
        } else if (value.includes("_")) {
            setError(true);
            setMessage(`Incomplete field`);
            if (setValid) {
                setValid(id, false);
            }
        } else if (numeric && !isNumeric(value.replaceAll("-", ""))) {
            setError(true);
            setMessage("Input should be numeric");
            if (setValid) {
                setValid(id, false);
            }
        } else {
            setError(false);
            setMessage("");
            if (setValid) {
                setValid(id, true);
            }
        }
    }, [value]);

    return <FormControl error = {error}>
        <PatternFormat
            customInput={TextField}
            margin="normal"
            id={id}
            label={label}
            name={id}
            defaultValue = { defaultText ? defaultText : "" }
            format = {pattern}
            mask = "_"
            disabled = {disabled}
            required = {required}
            onChange = {event => setValue(event.target.value)}
            error = {error}
            fullWidth = {fullWidth}
        />
        {
            message.length > 0 && <FormHelperText id = {id}>{ message }</FormHelperText>
        }
    </FormControl>
}