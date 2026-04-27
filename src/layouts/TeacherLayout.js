import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import axiosClient from "../api/axiosClient";
import "./TeacherLayout.css";

import DashboardIcon from "@mui/icons-material/Dashboard";
import QuizIcon from "@mui/icons-material/Quiz";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import AssessmentIcon from "@mui/icons-material/Assessment";
import BarChartIcon from "@mui/icons-material/BarChart";
import PersonIcon from "@mui/icons-material/Person";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import LeaderboardIcon from "@mui/icons-material/Leaderboard";
import CategoryIcon from "@mui/icons-material/Category";
import MenuBookIcon from "@mui/icons-material/MenuBook";

const TeacherLayout = () => {

const navigate = useNavigate();
const location = useLocation();

const [sidebarOpen,setSidebarOpen] = useState(false);
const [collapsed,setCollapsed] = useState(true);
const [dropdownOpen,setDropdownOpen] = useState(false);
const [initial,setInitial] = useState("T");
const [profilePic, setProfilePic] = useState(null);
const [userName, setUserName] = useState("Teacher");

/* USER INITIAL + PROFILE PIC */

useEffect(()=>{

  const token = localStorage.getItem("token");
  if(!token) return;

  const decoded = jwtDecode(token);
  const name =
    decoded.name ||
    decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"];

  if(name){
    setInitial(name.charAt(0).toUpperCase());
    setUserName(name);
  }

  const userId =
    decoded.UserId || decoded.userId || decoded.sub || "";

  if(userId){
    axiosClient.get(`/User/${userId}`)
      .then(res => {
        if(res.data.success && res.data.data.profilePicture){
          const BASE = `http://${window.location.hostname}:5273`;
          setProfilePic(BASE + res.data.data.profilePicture);
        }
      })
      .catch(() => {});
  }

},[]);


/* CLOSE DROPDOWN OUTSIDE CLICK */

useEffect(()=>{

const handleClickOutside = (e)=>{

if(!e.target.closest(".profile-dropdown") && 
   !e.target.closest(".profile-circle")){
setDropdownOpen(false);
}

};

document.addEventListener("click",handleClickOutside);

return ()=>{
document.removeEventListener("click",handleClickOutside);
};

},[]);


/* LOGOUT */

const logout = ()=>{
localStorage.removeItem("token");
navigate("/", { replace:true });
};

const closeSidebar = ()=>{
if(window.innerWidth < 768){
setSidebarOpen(false);
}
};

return (

<div className="dashboard-layout">

{sidebarOpen && (
<div
className="sidebar-overlay"
onClick={()=>setSidebarOpen(false)}
></div>
)}

<div
className={`sidebar ${collapsed ? "collapsed" : ""} ${sidebarOpen ? "open" : ""}`}
onMouseEnter={()=>setCollapsed(false)}
onMouseLeave={()=>setCollapsed(true)}
>

<div className="sidebar-header">

<h2 className="sidebar-logo">
<span className="logo-full">QuizPlatform</span>
<span className="logo-mini">QP</span>
</h2>

</div>

<ul className="sidebar-menu">

<li>
<NavLink to="/teacher/dashboard" onClick={closeSidebar}>
<DashboardIcon className="icon"/>
<span>Dashboard</span>
</NavLink>
</li>

<li>
<NavLink to="/teacher/quizzes" onClick={closeSidebar}>
<QuizIcon className="icon"/>
<span>My Quizzes</span>
</NavLink>
</li>

<li>
<NavLink to="/teacher/categories" onClick={closeSidebar}>
<CategoryIcon className="icon"/>
<span>Categories</span>
</NavLink>
</li>

<li>
<NavLink to="/teacher/create" onClick={closeSidebar}>
<AddCircleIcon className="icon"/>
<span>Create Quiz</span>
</NavLink>
</li>

<li>
  <NavLink to="/teacher/learn" onClick={closeSidebar}>
    <MenuBookIcon className="icon"/>
    <span>Learn & Practice</span>
  </NavLink>
</li>

<li>
<NavLink to="/teacher/reports" onClick={closeSidebar}>
<AssessmentIcon className="icon"/>
<span>Reports</span>
</NavLink>
</li>

<li>
<NavLink to="/teacher/analytics" onClick={closeSidebar}>
<BarChartIcon className="icon"/>
<span>Analytics</span>
</NavLink>
</li>

<li>
<NavLink to="/teacher/profile" onClick={closeSidebar}>
<PersonIcon className="icon"/>
<span>Profile</span>
</NavLink>
</li>

<li>
<NavLink to="/teacher/leaderboard" onClick={closeSidebar}>
<LeaderboardIcon className="icon"/>
<span>Leaderboard</span>
</NavLink>
</li>

</ul>

</div>

<div className="dashboard-main">

<div className="dashboard-topbar">

<div className="topbar-left">

<button
className="hamburger"
onClick={()=>setSidebarOpen(!sidebarOpen)}
>
<MenuIcon/>
</button>

<h3 className="topbar-title">Teacher Panel</h3>

</div>

<div className="topbar-actions">

<div
className="profile-circle"
onClick={()=>setDropdownOpen(!dropdownOpen)}
>
{profilePic
  ? <img src={profilePic} alt="avatar" className="profile-circle-img" />
  : initial
}
</div>

{dropdownOpen && (

<div className="profile-dropdown">

<div className="dropdown-user">

<div className="user-avatar">
  {profilePic
    ? <img src={profilePic} alt="avatar" className="profile-circle-img" />
    : initial
  }
</div>

<div className="user-info">
<span className="user-name">{userName}</span>
<span className="user-role">Instructor</span>
</div>

</div>

<div className="dropdown-divider"></div>

<div
className="dropdown-item"
onClick={()=>{
navigate("/teacher/profile");
setDropdownOpen(false);
}}
>
<PersonIcon className="dropdown-icon"/>
Profile
</div>

<div
className="dropdown-item"
onClick={()=>{
navigate("/teacher/settings");
setDropdownOpen(false);
}}
>
<SettingsIcon className="dropdown-icon"/>
Settings
</div>

<div
className="dropdown-item"
onClick={()=>{
navigate("/teacher/reports");
setDropdownOpen(false);
}}
>
<AssessmentIcon className="dropdown-icon"/>
Reports
</div>

<div className="dropdown-divider"></div>

<div
className="dropdown-item logout"
onClick={()=>{
logout();
setDropdownOpen(false);
}}
>
<LogoutIcon className="dropdown-icon"/>
Logout
</div>

</div>

)}

</div>

</div>

<div className="dashboard-content">
  <div key={location.pathname} className="page-animate">
    <Outlet/>
  </div>
</div>

</div>

</div>

);

};

export default TeacherLayout;