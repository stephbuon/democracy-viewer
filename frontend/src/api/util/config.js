const getToken = () => {
    let demoV = JSON.parse(localStorage.getItem('democracy-viewer'));
    if (demoV && demoV.user) {
        return demoV.user.token;
    } else {
        return undefined;
    }
}

export const apiConfig = (isFileUpload = false) => {
    const token = getToken();
    if (token) {
        const headers = {
            Authorization: `Bearer ${ token }`
        };

        if (isFileUpload) {
            headers["Content-Type"] = "multipart/form-data"
        }

        return { headers };
    } else {
        return {};
    }
};