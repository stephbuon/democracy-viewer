import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from "react";




export const SubsetSearch = (props) => {
    const navigate = useNavigate();

    const [searchTerm, setSearchTerm] = useState('');

    const searchFunction = () => {
        navigate(`/subsetsearch/${searchTerm}`)
    }

    //code to see if enter key is pressed (search when that happens)
    useEffect(() => {
        const keyDownHandler = event => {
            console.log('User pressed: ', event.key);

            if (event.key === 'Enter') {
                searchFunction();
            }
        };

        document.addEventListener('keydown', keyDownHandler);

        return () => {
            document.removeEventListener('keydown', keyDownHandler);
        };
    }, []);


    return (<div className='darkblue'>
        <row>
            <input type="text" id='searchTerm' value={searchTerm} onChange={event => { setSearchTerm(event.target.value) }} />
            <button type='button' onClick={() => searchFunction()}>Search</button>
        </row>
    </div >)

}