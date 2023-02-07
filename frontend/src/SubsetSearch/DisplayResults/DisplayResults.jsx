import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from "react";


import './DisplayResults.css';
export const DisplayResults = (props) => {

    const [results] = useState(props.results)

    //code to see if enter key is pressed (search when that happens)
    useEffect(() => {
    }, []);


    return (<div>
        {results.map(() => {
            return <div className="displayRow">
                Display results here? Not exactly sure how this should go down
            </div>})}
    </div >)

}