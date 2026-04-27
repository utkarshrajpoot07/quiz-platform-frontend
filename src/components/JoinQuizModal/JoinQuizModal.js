import React, { useState } from "react";
import axiosClient from "../../api/axiosClient";
import { useNavigate } from "react-router-dom";
import jsQR from "jsqr";
import "./JoinQuizModal.css";

const JoinQuizModal = ({ open, onClose }) => {

const [tab,setTab] = useState("code");
const [code,setCode] = useState("");
const [link,setLink] = useState("");

const navigate = useNavigate();

if(!open) return null;


// JOIN BY CODE

const joinByCode = async()=>{

try{

const res = await axiosClient.get(`/quiz/join/${code}`);

const quizId = res.data.data.quizId || res.data.data.id;

navigate(`/quiz/${quizId}`);

}catch{

alert("Invalid Quiz Code");

}

};


// JOIN BY LINK

const joinByLink = async()=>{

try{

const url = new URL(link);

const quizCode = url.pathname.split("/").pop();

const res = await axiosClient.get(`/quiz/join/${quizCode}`);

const quizId = res.data.data.quizId || res.data.data.id;

navigate(`/quiz/${quizId}`);

}catch{

alert("Invalid Quiz Link");

}

};


// QR IMAGE UPLOAD

const handleQRUpload = (event)=>{

const file = event.target.files[0];

if(!file) return;

const reader = new FileReader();

reader.onload = function(){

const img = new Image();

img.src = reader.result;

img.onload = async function(){

const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");

canvas.width = img.width;
canvas.height = img.height;

ctx.drawImage(img,0,0);

const imageData = ctx.getImageData(0,0,canvas.width,canvas.height);

const qrCode = jsQR(imageData.data,imageData.width,imageData.height);

if(qrCode){

try{

const url = new URL(qrCode.data);
const quizCode = url.pathname.split("/").pop();

const res = await axiosClient.get(`/quiz/join/${quizCode}`);

const quizId = res.data.data.quizId || res.data.data.id;

navigate(`/quiz/${quizId}`);

}catch{

alert("Invalid QR Code");

}

}else{

alert("QR Code not detected");

}

};

};

reader.readAsDataURL(file);

};


return (

<div className="join-modal-overlay">

<div className="join-modal">

<h2>Join Quiz</h2>


{/* TABS */}

<div className="join-tabs">

<button
className={tab==="code"?"active":""}
onClick={()=>setTab("code")}
>
Enter Code
</button>

<button
className={tab==="link"?"active":""}
onClick={()=>setTab("link")}
>
Paste Link
</button>

<button
className={tab==="qr"?"active":""}
onClick={()=>setTab("qr")}
>
Upload QR
</button>

</div>


{/* ENTER CODE */}

{tab==="code" && (

<div className="join-body">

<input
placeholder="Enter Quiz Code"
value={code}
onChange={(e)=>setCode(e.target.value)}
/>

<button onClick={joinByCode}>
Join Quiz
</button>

</div>

)}


{/* PASTE LINK */}

{tab==="link" && (

<div className="join-body">

<input
placeholder="Paste Quiz Link"
value={link}
onChange={(e)=>setLink(e.target.value)}
/>

<button onClick={joinByLink}>
Join Quiz
</button>

</div>

)}


{/* UPLOAD QR */}

{tab==="qr" && (

<div className="qr-upload">

<input
type="file"
accept="image/*"
onChange={handleQRUpload}
/>

<p>Upload QR Code Image</p>

</div>

)}


<button className="close-btn" onClick={onClose}>
✕
</button>

</div>

</div>

);

};

export default JoinQuizModal;