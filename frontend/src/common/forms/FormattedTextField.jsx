import { TextField, FormControl, FormHelperText } from "@mui/material";
import { isEmail, isStrongPassword, isURL, isNumeric } from "validator";
import { useEffect, useState } from "react";

export const FormattedTextField = ({ id, label, defaultText, disabled, password, email, website, numeric, maxChars, required, setValid, autoComplete, autoFocus, fullWidth, confirmPassword, setValue }) => {
    const [valueInt, setValueInt] = useState(defaultText ? defaultText : "");
    const [error, setError] = useState(false);
    const [message, setMessage] = useState("");
    const [type, setType] = useState("text");

    useEffect(() => {
        if (setValue) {
            setValue(valueInt);
        }

        if (required && !valueInt) {
            if (setValid) {
                setValid(id, false);
            }
        } else if (!required && !valueInt) {
            setError(false);
            setMessage("");
            if (setValid) {
                setValid(id, true);
            }
        } else if (password && !isStrongPassword(valueInt)) {
            setError(true);
            setMessage("Password must be at least 8 characters with one uppercase and one lowercase letter, a number, and a special character");
            if (setValid) {
                setValid(id, false);
            }
        } else if (confirmPassword && confirmPassword !== valueInt) {
            setError(true);
            setMessage("Passwords do not match");
            if (setValid) {
                setValid(id, false);
            }
        } else if (email && !isEmail(valueInt)) {
            setError(true);
            setMessage("Invalid email");
            if (setValid) {
                setValid(id, false);
            }
        } else if (website && !isURL(valueInt)) {
            setError(true);
            setMessage("Invalid URL");
            if (setValid) {
                setValid(id, false);
            }
        } else if (numeric && !isNumeric(valueInt)) {
            setError(true);
            setMessage("Input should be numeric");
            if (setValid) {
                setValid(id, false);
            }
        } else if (maxChars && valueInt.length > maxChars) {
            setError(true);
            setMessage(`Exceeded maximum ${ maxChars } character limit`);
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
    }, [valueInt]);

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
    }, []);

    return <FormControl error = {error} fullWidth = {fullWidth}>
        <TextField
            id={id}
            label={label}
            name={id}
            defaultValue = { defaultText ? defaultText : "" }
            disabled = {disabled}
            required = {required}
            onChange = {event => setValueInt(event.target.value)}
            error = {error}
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