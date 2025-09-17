import axios from 'axios';
import React, { useState } from 'react'

const API = 'http://localhost:8080/api/attendance';

const Attendence = () => {
    const [form, setForm] = useState({ fullName: '', email: '' });

    let save = e => {
        e.preventDefault();
        console.log(form.fullName);
        console.log(form.email);
        axios.post(API, form)
            .then(res => {
                console.log("Saved:", res.data);
            })
            .catch(err => {
                console.error(err);
            });
    }
    return (
        <div>
            <form onSubmit={save}>
                <label>full name : </label>
                <input type="text" placeholder='enter fullName' value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} />
                <br /><br />
                <label>email : </label>
                <input type="email" placeholder='enter email' value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                <br /><br /><hr />
                <input type="submit" value='save' />
            </form>
        </div>
    )
}

export default Attendence
