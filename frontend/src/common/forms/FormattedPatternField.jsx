import { TextField, FormControl, FormHelperText } from "@mui/material";
import { useEffect, useState } from "react";
import { PatternFormat } from "react-number-format";
import { isNumeric } from "validator";

export const FormattedPatternField = ({ id, label, defaultText, pattern, numeric, disabled, required, setValid, fullWidth }) => {
    const [valueInternal, setValueInternal] = useState(defaultText ? defaultText : "");
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (required && !valueInternal) {
            setMessage(" ");
        } else if (!required && !valueInternal) {
            setMessage("");
        } else if (valueInternal.includes("_")) {
            setMessage(`Incomplete field`);
        } else if (numeric && !isNumeric(valueInternal.replaceAll("-", ""))) {
            setMessage("Input should be numeric");
        } else {
            setMessage("");
        }
    }, [valueInternal]);

    useEffect(() => {
        if (setValid) {
            setValid(message.length === 0);
        }
    }, [setValid, message]);

    return <FormControl error = {message.length > 0} fullWidth = {fullWidth}>
        <PatternFormat
            customInput={TextField}
            id={id}
            label={label}
            name={id}
            defaultvalue = { defaultText ? defaultText : "" }
            format = {pattern}
            mask = "_"
            disabled = {disabled}
            required = {required}
            onChange = {event => setValueInternal(event.target.value)}
            error = {message.length > 0}
            fullWidth = {fullWidth}
        />
        {
            message.length > 0 && <FormHelperText id = {id}>{ message }</FormHelperText>
        }
    </FormControl>
}