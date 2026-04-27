import React,{useState} from "react";
import "./Register.css";
import { TextField, Button, Card, CardContent, Typography, MenuItem } from "@mui/material";
import { Link,useNavigate } from "react-router-dom";
import axiosClient from "../../api/axiosClient";

const Register = () => {

  const navigate = useNavigate();

  const [form,setForm] = useState({

    fullName:"",
    email:"",
    password:"",
    userTypeId:3

  });

  const handleChange = (e)=>{

    const {name,value} = e.target;

    setForm({

      ...form,

      [name]: name === "userTypeId" ? parseInt(value) : value

    });

  };

  const handleRegister = async(e)=>{

    e.preventDefault();

    try{

      console.log("Payload:",form);

      await axiosClient.post("/auth/register",form);

      alert("Registration Successful");

      navigate("/login");

    }
    catch(error){

      console.log("FULL ERROR:", error);
      console.log("BACKEND DATA:", error.response?.data);
      console.log("MESSAGE:", error.response?.data?.message);

      alert(error.response?.data?.message || "Registration Failed");

    }

  };

  return(

    <div className="register-container">

      <Card className="register-card">

        <CardContent>

          <Typography variant="h4" className="register-title">
            Create Account ✨
          </Typography>

          <p className="register-subtitle">
            Join the platform and start learning today
          </p>

          <form onSubmit={handleRegister}>

            <TextField
              label="Full Name"
              name="fullName"
              fullWidth
              margin="normal"
              onChange={handleChange}
              required
            />

            <TextField
              label="Email Address"
              name="email"
              fullWidth
              margin="normal"
              onChange={handleChange}
              required
            />

            <TextField
              label="Password"
              name="password"
              type="password"
              fullWidth
              margin="normal"
              onChange={handleChange}
              required
            />

            <TextField
              label="Phone Number"
              name="phone"
              fullWidth
              margin="normal"
              onChange={handleChange}
              inputProps={{ maxLength: 10 }}
            />

            <TextField
              select
              label="Register As"
              name="userTypeId"
              value={form.userTypeId}
              fullWidth
              margin="normal"
              onChange={handleChange}
            >
              <MenuItem value={1}>Admin</MenuItem>
              <MenuItem value={2}>Teacher</MenuItem>
              <MenuItem value={3}>Student</MenuItem>
            </TextField>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              className="register-btn"
            >
              Register
            </Button>

            <p className="register-switch">
              Already have account?
              <Link to="/login"> Login here</Link>
            </p>

          </form>

        </CardContent>

      </Card>

    </div>

  );

};

export default Register;