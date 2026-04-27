import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosClient from "../../api/axiosClient";

import {
  TextField,
  Button,
  Paper,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  Divider
} from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";

import "./AddQuestions.css";

const AddQuestions = () => {

  const { quizId } = useParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);

  const [form, setForm] = useState({
    text: "",
    option1: "",
    option2: "",
    option3: "",
    option4: "",
    correctOption: ""
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  // FETCH QUESTIONS
  const fetchQuestions = async () => {
    try {
      const res = await axiosClient.get(`/question/quiz/${quizId}`);

      if (res.data.success) {
        setQuestions(res.data.data);
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  // ADD QUESTION
  const addQuestion = async (e) => {

    e.preventDefault();

    if (!form.correctOption) {
      alert("Please select correct option");
      return;
    }

    try {

      await axiosClient.post("/question/add", {

        quizId: quizId,

        text: form.text,

        options: [
          { optionText: form.option1, isCorrect: form.correctOption === "1" },
          { optionText: form.option2, isCorrect: form.correctOption === "2" },
          { optionText: form.option3, isCorrect: form.correctOption === "3" },
          { optionText: form.option4, isCorrect: form.correctOption === "4" }
        ]

      });

      alert("Question Added Successfully");

      setForm({
        text: "",
        option1: "",
        option2: "",
        option3: "",
        option4: "",
        correctOption: ""
      });

      fetchQuestions();

    } catch (err) {
      console.log(err);
      alert("Error adding question");
    }
  };

  // DELETE QUESTION
  const deleteQuestion = async (id) => {

    if (!window.confirm("Delete this question?")) return;

    try {
      await axiosClient.delete(`/question/delete/${id}`);
      fetchQuestions();
    } catch (err) {
      console.log(err);
    }
  };

  return (

    <div className="add-question-page">

      {/* FORM */}

      <Paper className="question-card">

        <Typography variant="h5" className="title">
          Add Question
        </Typography>

        <form onSubmit={addQuestion} className="question-form">

          <TextField
            label="Question"
            name="text"
            value={form.text}
            fullWidth
            required
            onChange={handleChange}
          />

          <TextField
            label="Option 1"
            name="option1"
            value={form.option1}
            fullWidth
            required
            onChange={handleChange}
          />

          <TextField
            label="Option 2"
            name="option2"
            value={form.option2}
            fullWidth
            required
            onChange={handleChange}
          />

          <TextField
            label="Option 3"
            name="option3"
            value={form.option3}
            fullWidth
            required
            onChange={handleChange}
          />

          <TextField
            label="Option 4"
            name="option4"
            value={form.option4}
            fullWidth
            required
            onChange={handleChange}
          />

          <div className="correct-option">

            <Typography>Correct Option</Typography>

            <RadioGroup
              row
              name="correctOption"
              value={form.correctOption}
              onChange={handleChange}
            >

              <FormControlLabel value="1" control={<Radio />} label="1" />
              <FormControlLabel value="2" control={<Radio />} label="2" />
              <FormControlLabel value="3" control={<Radio />} label="3" />
              <FormControlLabel value="4" control={<Radio />} label="4" />

            </RadioGroup>

          </div>

          <Button
            variant="contained"
            type="submit"
          >
            Add Question
          </Button>

          <Button
            variant="contained"
            color="success"
            style={{ marginTop: "20px" }}
            onClick={() => navigate("/teacher/quizzes")}
          >
            Finish Quiz
          </Button>

        </form>

      </Paper>

      {/* QUESTION LIST */}

      <Paper className="question-list">

        <Typography variant="h6">
          Questions Added
        </Typography>

        <Divider />

        {questions.map((q, index) => (

          <div key={q.id} className="question-item">

            <div className="question-text">
              {index + 1}. {q.text}
            </div>

            <Button
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => deleteQuestion(q.id)}
            >
              Delete
            </Button>

          </div>

        ))}

      </Paper>

    </div>

  );
};

export default AddQuestions;