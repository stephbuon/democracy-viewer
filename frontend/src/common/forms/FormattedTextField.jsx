import { TextField, FormControl, FormHelperText } from "@mui/material";
import { isEmail, isStrongPassword, isURL, isNumeric } from "validator";
import { useEffect, useState } from "react";

export const FormattedTextField = ({ id, label, defaultText, disabled, password, email, website, numeric, maxChars, required, setValid, autoComplete, autoFocus, fullWidth, confirmPassword, setValue }) => {
    const [valueInternal, setValueInternal] = useState(defaultText ? defaultText : "");
    const [message, setMessage] = useState("");
    const [type, setType] = useState("text");

    useEffect(() => {
        if (setValue) {
            setValue(valueInternal);
        }

        if (required && !valueInternal) {
            setMessage(" ");
        } else if (!required && !valueInternal) {
            setMessage("");
        } else if (password && !isStrongPassword(valueInternal)) {
            setMessage("Password must be at least 8 characters with one uppercase and one lowercase letter, a number, and a special character");
        } else if (confirmPassword && confirmPassword !== valueInternal) {
            setMessage("Passwords do not match");
        } else if (email && !isEmail(valueInternal)) {
            setMessage("Invalid email");
        } else if (website && !isURL(valueInternal)) {
            setMessage("Invalid URL");
        } else if (numeric && !isNumeric(valueInternal)) {
            setMessage("Input should be numeric");
        } else if (maxChars && valueInternal.length > maxChars) {
            setMessage(`Exceeded maximum ${ maxChars } character limit`);
        } else {
            setMessage("");
        }
    }, [valueInternal]);

    useEffect(() => {
        if (setValid) {
            setValid(message.length === 0);
        }
    }, [setValid, message])

    useEffect(() => {
        if (password || confirmPassword) {
            setType("password")
        } else if (email) {
            setType("email")
        } else if (website) {
            setType("url");
        } else if (numeric) {
            setType("number");
        }
    }, [confirmPassword, password, email, website, numeric]);

    return <FormControl error = {message.length > 0} fullWidth = {fullWidth}>
        <TextField
            id={id}
            label={label}
            name={id}
            defaultValue = { defaultText ? defaultText : "" }
            disabled = {disabled}
            required = {required}
            onChange = {event => setValueInternal(event.target.value)}
            error = {message.length > 0}
            type = {type}
            autoComplete = {autoComplete ? autoComplete : ""}
            autoFocus = {autoFocus}
            fullWidth = {fullWidth}
        />
        {
            message.length > 0 && <FormHelperText id = {id}>{ message }</FormHelperText>
        }
    </FormControl>
}