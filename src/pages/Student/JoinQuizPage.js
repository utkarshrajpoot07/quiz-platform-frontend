import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import axiosClient from "../../api/axiosClient";

const JoinQuizPage = () => {

const { code } = useParams();
const navigate = useNavigate();

useEffect(()=>{

const joinQuiz = async ()=>{

try{

const res = await axiosClient.get(`/quiz/join/${code}`);

const quizId = res.data.data.quizId || res.data.data.id;

navigate(`/quiz/${quizId}`);

}catch(err){

alert("Invalid quiz link");

}

};

joinQuiz();

},[code,navigate]);

return <div style={{padding:"40px"}}>Joining Quiz...</div>;

};

export default JoinQuizPage;