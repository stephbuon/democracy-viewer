import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from "react";

import './SubsetSearch.css'


export const SubsetSearch = (props) => {
    const navigate = useNavigate();

    const [searchTerm, setSearchTerm] = useState('');

    const searchFunction = () => {
        console.log("navigating")
        navigate(`/subsetsearch/${searchTerm}`)
        console.log("did not navigate from search page")

    }

    //code to see if enter key is pressed (search when that happens)
    useEffect(() => {
        const keyDownHandler = event => {
            // console.log('User pressed: ', event.key);

            if (event.key === 'Enter') {
                console.log('User pressed: Enter');
                searchFunction();
            }
        };

        document.addEventListener('keydown', keyDownHandler);

        return () => {
            document.removeEventListener('keydown', keyDownHandler);
        };
    }, []);


    return (<div className='darkblue'>
        <row className='searchbarrow'>
            <input type="text" id='searchTerm' value={searchTerm} onChange={event => { setSearchTerm(event.target.value) }} />
            <button type='button' onClick={() => searchFunction()}>Search</button>
        </row>
    </div >)

}