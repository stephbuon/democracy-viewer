import { TextField, FormControl, FormHelperText } from "@mui/material";
import { useEffect, useState } from "react";
import { PatternFormat } from "react-number-format";
import { isNumeric } from "validator";

export const FormattedPatternField = (props) => {
    const [valueInternal, setValueInternal] = useState(props.defaultValue ? props.defaultValue : "");
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (props.setValue) {
            props.setValue(valueInternal);
        }

        if (props.required && !valueInternal) {
            setMessage(" ");
        } else if (!props.required && !valueInternal) {
            setMessage("");
        } else if (valueInternal.includes("_")) {
            setMessage(`Incomplete field`);
        } else if (props.numeric && !isNumeric(valueInternal.replaceAll("-", ""))) {
            setMessage("Input should be numeric");
        } else {
            setMessage("");
        }
    }, [valueInternal]);

    useEffect(() => {
        if (props.setValid) {
            props.setValid(message.length === 0);
        }
    }, [props.setValid, message]);

    return <FormControl error = {message.length > 0} fullWidth = {props.fullWidth}>
        <PatternFormat
            {...props}
            customInput={TextField}
            variant="filled"
            onChange = {event => setValueInternal(event.target.value)}
            error = {message.length > 0}
        />
        {
            message.length > 0 && <FormHelperText id = {props.id}>{ message }</FormHelperText>
        }
    </FormControl>
}