import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ForgotPassword.css";
import { TextField, Button, Card, CardContent, Typography } from "@mui/material";
import axiosClient from "../../api/axiosClient";

const ForgotPassword = () => {

const [email,setEmail] = useState("");
const navigate = useNavigate();

const handleSubmit = async(e)=>{

e.preventDefault();

try{

await axiosClient.post(`/auth/forgot-password?email=${email}`);

alert("OTP sent to your email");

navigate("/reset-password",{state:{email}});

}
catch{

alert("Error sending OTP");

}

};

return(

<div className="forgot-container">

<Card className="forgot-card">

<CardContent>

<Typography variant="h4" className="forgot-title">
Forgot Password 🔐
</Typography>

<p className="forgot-subtitle">
Enter your email to receive OTP
</p>

<form onSubmit={handleSubmit}>

<TextField
label="Email address"
fullWidth
margin="normal"
onChange={(e)=>setEmail(e.target.value)}
/>

<Button
type="submit"
variant="contained"
fullWidth
className="forgot-btn"
>
Send OTP
</Button>

</form>

</CardContent>

</Card>

</div>

);

};

export default ForgotPassword;