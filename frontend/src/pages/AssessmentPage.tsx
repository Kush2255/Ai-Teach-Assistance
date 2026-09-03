import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Award, CheckCircle2, ArrowRight } from 'lucide-react';
import { fetchAssessmentReport } from '../services/api';

export const AssessmentPage: React.FC = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const questions = [
    {
      id: "q1",
      question: "According to Ohm's Law (V = I × R), if Voltage V remains constant and Resistance R is doubled, what happens to Current I?",
      options: ["Current doubles", "Current decreases by half", "Current quadruples", "Current remains unchanged"],
      concept: "Ohm's Law Inverse Proportion"
    },
    {
      id: "q2",
      question: "If a 12V battery is connected across a resistor of 4 Ohms, what current flows through the circuit?",
      options: ["3 Amperes", "48 Amperes", "8 Amperes", "1.5 Amperes"],
      concept: "Quantitative Calculation"
    },
    {
      id: "q3",
      question: "Which water pipe analogy best represents Electrical Resistance?",
      options: ["Water pressure in reservoir", "Narrow pipe restricting water flow", "Rate of water gallons per minute", "Length of water tank"],
      concept: "Conceptual Analogy"
    }
  ];

  const handleOptionSelect = (qId: string, option: string) => {
    setSelectedAnswers({ ...selectedAnswers, [qId]: option });
  };

  const handleFinishQuiz = async () => {
    setIsSubmitting(true);
    try {
      if (lessonId) {
        await fetchAssessmentReport(lessonId);
        navigate(`/report/${lessonId}`);
      } else {
        navigate(`/report/demo_electricity_101`);
      }
    } catch (e) {
      console.error(e);
      navigate(`/report/demo_electricity_101`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-2 bg-emerald-950 px-3 py-1 rounded-full text-xs font-semibold text-emerald-400 border border-emerald-500/30">
          <Award className="w-4 h-4" />
          <span>Final Adaptive Assessment</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">Post-Lesson Quiz</h1>
        <p className="text-sm text-slate-400">Verify your concept mastery across Ohm's Law and circuit mechanics.</p>
      </div>

      <div className="space-y-6">
        {questions.map((q, idx) => (
          <div key={q.id} className="glass-panel p-6 rounded-3xl space-y-4 border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-950 px-2.5 py-1 rounded border border-indigo-500/30">
                Question #{idx + 1}
              </span>
              <span className="text-xs text-slate-400 font-medium">Target: {q.concept}</span>
            </div>

            <h3 className="font-bold text-white text-base leading-snug">{q.question}</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {q.options.map((opt) => {
                const isSelected = selectedAnswers[q.id] === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleOptionSelect(q.id, opt)}
                    className={`p-3.5 rounded-xl border text-left text-xs font-medium transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-indigo-950 border-indigo-500 text-white shadow-lg'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <span>{opt}</span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-400 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        <button
          onClick={handleFinishQuiz}
          disabled={isSubmitting}
          className="w-full py-4 rounded-2xl gradient-button font-bold text-base shadow-2xl flex items-center justify-center space-x-2"
        >
          <span>{isSubmitting ? "Generating Assessment Report..." : "Submit Assessment & View Learning Report"}</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
