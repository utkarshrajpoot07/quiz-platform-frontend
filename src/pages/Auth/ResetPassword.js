import React,{useState} from "react";
import { useLocation,useNavigate } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import { TextField, Button, Card, CardContent, Typography } from "@mui/material";

const ResetPassword = ()=>{

const location = useLocation();
const navigate = useNavigate();

const email = location.state?.email || "";

const [otp,setOtp] = useState("");
const [password,setPassword] = useState("");

const handleReset = async(e)=>{

e.preventDefault();

try{

await axiosClient.post("/auth/reset-password",{
email:email,
otp:otp,
newPassword:password
});

alert("Password reset successful");

navigate("/login");

}
catch{

alert("Invalid OTP or error");

}

};

return(

<div className="forgot-container">

<Card className="forgot-card">

<CardContent>

<Typography variant="h4">
Reset Password
</Typography>

<p>{email}</p>

<form onSubmit={handleReset}>

<TextField
label="Enter OTP"
fullWidth
margin="normal"
onChange={(e)=>setOtp(e.target.value)}
/>

<TextField
label="New Password"
type="password"
fullWidth
margin="normal"
onChange={(e)=>setPassword(e.target.value)}
/>

<Button
type="submit"
variant="contained"
fullWidth
>
Reset Password
</Button>

</form>

</CardContent>

</Card>

</div>

);

};

export default ResetPassword;