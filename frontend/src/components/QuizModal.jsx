import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, XCircle, Award, ChevronRight, ChevronLeft, RotateCcw } from 'lucide-react';
import { quizAPI } from '../services/api';
import LoadingSpinner from './LoadingSpinner';

const QuizModal = ({ quizId, courseTitle, onClose, onQuizComplete }) => {
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Quiz taking state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { [questionIndex]: optionIndex }
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Results state
  const [submissionResult, setSubmissionResult] = useState(null);
  const [showReview, setShowReview] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        const data = await quizAPI.getById(quizId);
        setQuiz(data.quiz);
      } catch (err) {
        setError(err.message || 'Failed to load quiz');
      } finally {
        setLoading(false);
      }
    };

    if (quizId) {
      fetchQuiz();
    }
  }, [quizId]);

  const handleSelectOption = (optionIndex) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: optionIndex,
    }));
  };

  const handleNext = () => {
    if (quiz && currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    if (!quiz) return;

    // Check if any question was left unanswered
    const totalQuestions = quiz.questions.length;
    const answeredCount = Object.keys(selectedAnswers).length;

    if (answeredCount < totalQuestions) {
      const confirmSubmit = window.confirm(
        `You have answered ${answeredCount} of ${totalQuestions} questions. Are you sure you want to submit?`
      );
      if (!confirmSubmit) return;
    }

    try {
      setIsSubmitting(true);
      const formattedAnswers = Object.entries(selectedAnswers).map(([qIdx, optIdx]) => ({
        questionIndex: Number(qIdx),
        selectedOptionIndex: optIdx,
      }));

      const res = await quizAPI.submit(quiz._id, formattedAnswers);
      setSubmissionResult(res.result);
      if (onQuizComplete) {
        onQuizComplete(res.result);
      }
    } catch (err) {
      alert(`Submission error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetake = () => {
    setSelectedAnswers({});
    setCurrentQuestionIndex(0);
    setSubmissionResult(null);
    setShowReview(false);
  };

  if (!quizId) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '720px' }}>
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
          <div>
            <span className="badge badge-primary" style={{ marginBottom: '0.4rem' }}>Assessment</span>
            <h3 style={{ fontSize: '1.3rem' }}>{quiz?.title || 'Course Quiz'}</h3>
            {courseTitle && <p style={{ fontSize: '0.85rem', color: '#64748b' }}>{courseTitle}</p>}
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '0.25rem' }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Content Body */}
        {loading ? (
          <LoadingSpinner text="Loading quiz questions..." />
        ) : error ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#ef4444' }}>
            <p>{error}</p>
            <button className="btn btn-secondary" onClick={onClose} style={{ marginTop: '1rem' }}>
              Close
            </button>
          </div>
        ) : submissionResult ? (
          /* RESULT SCREEN */
          <div>
            <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  backgroundColor: submissionResult.passed ? '#ecfdf5' : '#fef2f2',
                  color: submissionResult.passed ? '#10b981' : '#ef4444',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                }}
              >
                <Award size={44} />
              </div>

              <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>
                {submissionResult.passed ? 'Quiz Passed! 🎉' : 'Keep Trying! 💪'}
              </h2>

              <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
                {submissionResult.passed
                  ? 'Great job! You have demonstrated a solid understanding of this topic.'
                  : `You scored ${submissionResult.percentage}%. The passing threshold is ${submissionResult.passingScore}%.`}
              </p>

              {/* Score Metric Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', maxWidth: '460px', margin: '0 auto 2rem' }}>
                <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>
                    {submissionResult.score} / {submissionResult.totalMarks}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Score</div>
                </div>

                <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: submissionResult.passed ? '#10b981' : '#f59e0b' }}>
                    {submissionResult.percentage}%
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Percentage</div>
                </div>

                <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: submissionResult.passed ? '#10b981' : '#ef4444', marginTop: '4px' }}>
                    {submissionResult.passed ? 'PASSED' : 'RETRY'}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Status</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowReview(!showReview)}
                >
                  {showReview ? 'Hide Answers' : 'Review Answers'}
                </button>
                <button className="btn btn-outline" onClick={handleRetake}>
                  <RotateCcw size={16} /> Retake Quiz
                </button>
                <button className="btn btn-primary" onClick={onClose}>
                  Continue Course
                </button>
              </div>
            </div>

            {/* Answer Breakdown Review */}
            {showReview && (
              <div style={{ marginTop: '2rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem' }}>
                <h4 style={{ marginBottom: '1rem' }}>Detailed Answer Key & Explanations:</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {submissionResult.answers.map((ans, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '1rem 1.25rem',
                        borderRadius: '10px',
                        border: `1px solid ${ans.isCorrect ? '#a7f3d0' : '#fecaca'}`,
                        backgroundColor: ans.isCorrect ? '#f0fdf4' : '#fff5f5',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        {ans.isCorrect ? (
                          <CheckCircle2 size={18} color="#10b981" />
                        ) : (
                          <XCircle size={18} color="#ef4444" />
                        )}
                        <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                          Question {idx + 1}: {ans.questionText}
                        </span>
                      </div>

                      <div style={{ fontSize: '0.88rem', margin: '0.5rem 0 0.5rem 1.7rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                        <div>
                          <strong>Your Answer: </strong>
                          <span style={{ color: ans.isCorrect ? '#059669' : '#dc2626' }}>
                            {ans.selectedOptionIndex !== null && ans.selectedOptionIndex !== undefined
                              ? ans.options[ans.selectedOptionIndex]
                              : 'No answer selected'}
                          </span>
                        </div>
                        {!ans.isCorrect && (
                          <div>
                            <strong>Correct Answer: </strong>
                            <span style={{ color: '#059669', fontWeight: 600 }}>
                              {ans.options[ans.correctAnswerIndex]}
                            </span>
                          </div>
                        )}
                        {ans.explanation && (
                          <div style={{ marginTop: '0.4rem', fontSize: '0.82rem', color: '#475569', fontStyle: 'italic' }}>
                            💡 {ans.explanation}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* QUESTION VIEW */
          <div>
            {/* Step Counter & Progress */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', fontSize: '0.85rem', color: '#64748b' }}>
              <span>
                Question <strong>{currentQuestionIndex + 1}</strong> of <strong>{quiz?.questions?.length}</strong>
              </span>
              <span>
                {Math.round(((currentQuestionIndex + 1) / (quiz?.questions?.length || 1)) * 100)}% Completed
              </span>
            </div>

            {/* Stepper Progress bar */}
            <div style={{ width: '100%', height: '4px', backgroundColor: '#e2e8f0', borderRadius: '2px', marginBottom: '1.75rem' }}>
              <div
                style={{
                  width: `${((currentQuestionIndex + 1) / (quiz?.questions?.length || 1)) * 100}%`,
                  height: '100%',
                  backgroundColor: '#4f46e5',
                  borderRadius: '2px',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>

            {/* Current Question */}
            {quiz?.questions && quiz.questions[currentQuestionIndex] && (
              <div>
                <h4 style={{ fontSize: '1.15rem', marginBottom: '1.25rem', lineHeight: 1.4 }}>
                  {quiz.questions[currentQuestionIndex].questionText}
                </h4>

                {/* Options List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
                  {quiz.questions[currentQuestionIndex].options.map((option, optIdx) => {
                    const isSelected = selectedAnswers[currentQuestionIndex] === optIdx;
                    return (
                      <div
                        key={optIdx}
                        onClick={() => handleSelectOption(optIdx)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '1rem',
                          padding: '1rem 1.25rem',
                          borderRadius: '10px',
                          border: isSelected ? '2px solid #4f46e5' : '1px solid #e2e8f0',
                          backgroundColor: isSelected ? '#eef2ff' : '#ffffff',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <div
                          style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            border: isSelected ? '6px solid #4f46e5' : '2px solid #cbd5e1',
                            backgroundColor: '#fff',
                            flexShrink: 0,
                          }}
                        />
                        <span style={{ fontSize: '0.95rem', fontWeight: isSelected ? 600 : 400, color: '#0f172a' }}>
                          {option}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Navigation Buttons */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem' }}>
                  <button
                    className="btn btn-secondary"
                    onClick={handlePrev}
                    disabled={currentQuestionIndex === 0}
                  >
                    <ChevronLeft size={16} /> Previous
                  </button>

                  {currentQuestionIndex < quiz.questions.length - 1 ? (
                    <button className="btn btn-primary" onClick={handleNext}>
                      Next <ChevronRight size={16} />
                    </button>
                  ) : (
                    <button
                      className="btn btn-primary"
                      onClick={handleSubmitQuiz}
                      disabled={isSubmitting}
                      style={{ backgroundColor: '#10b981' }}
                    >
                      {isSubmitting ? 'Calculating Score...' : 'Submit Quiz 🚀'}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizModal;
