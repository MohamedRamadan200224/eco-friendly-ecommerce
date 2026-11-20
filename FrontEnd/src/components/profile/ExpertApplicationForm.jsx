// "Become an Expert" tab of the profile page, extracted from Profile.jsx.
//
// The ten application questions, submitted as { question1 … question10 }.
// No props: the form is self-contained and navigates home on success.
//
// All requests go through the shared api client (cookie auth, one shared
// error toast). No raw axios, no hardcoded backend URL, no Authorization
// header: the old `Bearer ${auth.jwtToken}` headers are gone — auth is
// the httpOnly cookie now, and getAuthToken() returns undefined anyway.
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../api/client";

const QUESTIONS = [
  [
    "question1",
    "How would you prioritize tasks if you have multiple products to assess but limited time?",
  ],
  [
    "question2",
    "Explain the key factors you consider when evaluating the environmental impact of a product.",
  ],
  [
    "question3",
    "Describe a scenario where you had to make a quick decision without compromising on accuracy.",
  ],
  [
    "question4",
    "What steps do you take to ensure that your assessment of a product is thorough and precise?",
  ],
  [
    "question5",
    "How do you maintain consistency in your voting when faced with a high volume of products to review?",
  ],
  [
    "question6",
    "Discuss the importance of impartiality in voting and how you uphold ethical standards.",
  ],
  [
    "question7",
    "If a new policy changes the criteria for product assessment, how quickly can you adapt your voting strategy?",
  ],
  [
    "question8",
    "How would you communicate your expert opinion to a seller whose product did not meet the eco-friendly criteria?",
  ],
  [
    "question9",
    "How do you handle feedback or criticism regarding your votes from other experts or users?",
  ],
  [
    "question10",
    "Are you able to commit to making at least one vote every 10 minutes during your active hours? Please explain your strategy for doing so.",
  ],
];

const ExpertApplicationForm = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState({
    question1: "",
    question2: "",
    question3: "",
    question4: "",
    question5: "",
    question6: "",
    question7: "",
    question8: "",
    question9: "",
    question10: "",
  });

  const ApplyAsExpert = (e) => {
    e.preventDefault();
    api
      .post(`/api/v1/expertApply`, questions)
      .then((resp) => {
        if (resp.data.status === "success") {
          toast.success(resp.data.message);
          navigate("/");
        }
      })
      .catch(() => {
        // Error already toasted once by the api client interceptor.
      });
  };

  return (
    <div className="mt-10">
      <h2 className="text-xl font-bold text-green-600">Become an Expert</h2>
      <div className="flex flex-col">
        {QUESTIONS.map(([key, label]) => (
          <React.Fragment key={key}>
            <label className="mt-3">{label}</label>
            <textarea
              className="h-[50px] rounded-md border border-cold-blue px-[20px] py-[12px]"
              rows="2"
              required
              value={questions[key]}
              onChange={(e) =>
                setQuestions({
                  ...questions,
                  [key]: e.target.value,
                })
              }
            ></textarea>
          </React.Fragment>
        ))}

        <input
          type="submit"
          className="h-[50px] w-full cursor-pointer rounded-md bg-cold-blue px-[20px] py-[12px] font-bold text-white mt-3 hover:bg-green-600 duration-200 hover-text-cold"
          value="Apply"
          onClick={ApplyAsExpert}
        />
      </div>
    </div>
  );
};

export default ExpertApplicationForm;
