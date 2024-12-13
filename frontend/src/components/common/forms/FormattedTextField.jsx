import { TextField, FormControl, FormHelperText } from "@mui/material";
import { isEmail, isStrongPassword, isURL, isNumeric } from "validator";
import { useEffect, useState } from "react";

export const FormattedTextField = (props) => {
    const [valueInternal, setValueInternal] = useState(props.defaultValue ? props.defaultValue : "");
    const [message, setMessage] = useState("");
    const [type, setType] = useState("text");

    useEffect(() => {
        if (props.setValue) {
            props.setValue(valueInternal);
        }

        if (props.required && !valueInternal) {
            setMessage(" ");
        } else if (!props.required && !valueInternal) {
            setMessage("");
        } else if (props.password && !isStrongPassword(valueInternal)) {
            setMessage("Password must be at least 8 characters with one uppercase and one lowercase letter, a number, and a special character");
        } else if (props.confirmPassword && props.confirmPassword !== valueInternal) {
            setMessage("Passwords do not match");
        } else if (props.email && !isEmail(valueInternal)) {
            setMessage("Invalid email");
        } else if (props.website && !isURL(valueInternal)) {
            setMessage("Invalid URL");
        } else if (props.numeric && !isNumeric(valueInternal)) {
            setMessage("Input should be numeric");
        } else if (props.maxChars && valueInternal.length > props.maxChars) {
            setMessage(`Exceeded maximum ${ props.maxChars } character limit`);
        } else {
            setMessage("");
        }
    }, [valueInternal]);

    useEffect(() => {
        if (props.setValid) {
            props.setValid(message.length === 0);
        }
    }, [props.setValid, message])

    useEffect(() => {
        if (props.password || props.confirmPassword) {
            setType("password")
        } else if (props.email) {
            setType("email")
        } else if (props.website) {
            setType("url");
        } else if (props.numeric) {
            setType("number");
        }
    }, [props.confirmPassword, props.password, props.email, props.website, props.numeric]);

    return <>
        <FormControl 
            error = {message.length > 0} 
            fullWidth = {props.fullWidth}
        >
            <TextField
                { ...props }
                onChange = {event => setValueInternal(event.target.value)}
                error = {message.length > 0}
                type = {type}
                autoComplete={type === "text" ? "off" : "on"}
            />
            {
                message.length > 0 && <FormHelperText id = {props.id}>{ message }</FormHelperText>
            }
        </FormControl>
    </>
}