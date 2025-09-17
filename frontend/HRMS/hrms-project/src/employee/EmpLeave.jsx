import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react'
import { toast } from 'react-toastify';
import { EmailContext } from '../components/EmailContext';
import './EmpNav.css'

const API = 'http://localhost:8080/api/leave';
const EMP_API = "http://localhost:8080/api/employees"

const EmpLeave = () => {

    const { email } = useContext(EmailContext);
    // console.log(email);
    const [leave, setLeave] = useState({ email: '', date: '' });
    const [lea, setLea] = useState([]);
    const [currentlea, setCurrentlea] = useState('');

    let handleLeave = e => {
        e.preventDefault();

        if (leave.email.trim().toLowerCase() !== email.toLowerCase()) {
            toast.error("Error: You can only apply leave for your own account!");
            return;
        }

        axios.post(API, leave)
            .then(res => toast.success("leave request sent successfully"))
            .catch(err => console.log(err));
    }

    useEffect(() => {
        axios.get(EMP_API)
            .then(res => setLea(res.data))
            .catch(err => console.log(err));
    }, []);

    useEffect(() => {

        if (lea.length > 0) {
            const matched = lea.find(lv => lv.email === email);

            console.log(matched);

            if (matched) {
                console.log("Leaves for", matched.email, "=", matched.leaves);
                setCurrentlea(matched.leaves);
            } else {
                console.log("not match");
            }
        }
    }, [lea, email]);

    return (
        <div className='emp-leave-first-div'>
            <h1>Remaining Leaves : {30 - currentlea}</h1>
            <form className='emp-leave-first-div-form' onSubmit={handleLeave}>
                <input type="email" placeholder='enter email' value={leave.email} onChange={e => setLeave({ ...leave, email: e.target.value })} />
                <br />
                <br />
                <input type="date" value={leave.date} onChange={e => setLeave({ ...leave, date: e.target.value })} />
                <br />
                <br />
                <hr />
                <input type="submit" value='leave' />
            </form>
        </div>
    )
}

export default EmpLeave
