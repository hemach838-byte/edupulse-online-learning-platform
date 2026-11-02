import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import confetti from 'canvas-confetti';
import {
  Award,
  Clock,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  BookOpen,
} from 'lucide-react';

export const QuizPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [quiz, setQuiz] = useState(null);
  const [course, setCourse] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { [questionId]: optionIndex }
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewMode, setReviewMode] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      setLoading(true);
      try {
        const [quizRes, courseRes] = await Promise.all([
          api.quizzes.getByCourse(courseId),
          api.courses.getOne(courseId),
        ]);

        if (quizRes.success && quizRes.quiz) {
          setQuiz(quizRes.quiz);
        }
        if (courseRes.success && courseRes.course) {
          setCourse(courseRes.course);
        }
      } catch (err) {
        toast.error('Failed to load quiz');
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [courseId]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '6rem 0', textAlign: 'center' }}>
        <div className="skeleton" style={{ width: '400px', height: '300px', margin: '0 auto', borderRadius: '16px' }} />
      </div>
    );
  }

  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return (
      <div className="container" style={{ padding: '6rem 0', textAlign: 'center' }}>
        <h2>No Quiz Available</h2>
        <p style={{ marginTop: '0.5rem', marginBottom: '2rem' }}>
          This course does not currently have an assessment quiz prepared.
        </p>
        <Link to={`/learn/${courseId}`} className="btn btn-primary">
          Back to Course Player
        </Link>
      </div>
    );
  }

  const questions = quiz.questions;
  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(selectedAnswers).length;

  const handleSelectOption = (qId, optionIdx) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [qId]: optionIdx,
    }));
  };

  const handleSubmit = async () => {
    if (answeredCount < totalQuestions) {
      if (!window.confirm(`You have only answered ${answeredCount} of ${totalQuestions} questions. Are you sure you want to submit?`)) {
        return;
      }
    }

    setSubmitting(true);
    try {
      const formattedAnswers = Object.entries(selectedAnswers).map(([qId, optionIdx]) => ({
        questionId: qId,
        selectedOption: optionIdx,
      }));

      const res = await api.quizzes.submit(quiz._id, {
        answers: formattedAnswers,
        timeSpentSeconds: 120,
      });

      if (res.success && res.result) {
        setResult(res.result);
        if (res.result.passed) {
          toast.success('Congratulations! You passed the assessment!');
          confetti({
            particleCount: 150,
            spread: 80,
            origin: { y: 0.5 },
          });
        } else {
          toast.info('Quiz completed. Check your score and try again to improve!');
        }
      }
    } catch (err) {
      toast.error(err.message || 'Error submitting quiz');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetake = () => {
    setSelectedAnswers({});
    setResult(null);
    setCurrentQuestionIndex(0);
    setReviewMode(false);
  };

  // Render Post-Submission Results Screen
  if (result) {
    return (
      <div className="container-narrow" style={{ padding: '4rem 1.5rem 6rem' }}>
        <div
          className="card animate-fade-in"
          style={{
            textAlign: 'center',
            padding: '3rem 2rem',
            background: 'var(--bg-card)',
            border: `1px solid ${result.passed ? 'rgba(16, 185, 129, 0.4)' : 'rgba(244, 63, 94, 0.4)'}`,
          }}
        >
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: result.passed ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.25rem',
            }}
          >
            {result.passed ? (
              <CheckCircle2 size={40} color="#10B981" />
            ) : (
              <XCircle size={40} color="#F43F5E" />
            )}
          </div>

          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
            {result.passed ? 'Assessment Passed! 🎉' : 'Assessment Completed'}
          </h1>
          <p style={{ color: '#94A3B8', marginBottom: '2rem' }}>
            {result.passed
              ? 'Excellent mastery of the course curriculum! Your passing score has been certified.'
              : `You scored ${result.percentage}%. The passing threshold is ${result.passingScore}%.`}
          </p>

          {/* Score Badge Card */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '2.5rem',
              background: 'rgba(255, 255, 255, 0.03)',
              padding: '1.5rem 2.5rem',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-subtle)',
              marginBottom: '2.5rem',
            }}
          >
            <div>
              <div style={{ fontSize: '0.85rem', color: '#94A3B8' }}>Earned Score</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#FFFFFF' }}>
                {result.score} / {result.totalMarks}
              </div>
            </div>
            <div style={{ width: '1px', height: '40px', background: 'var(--border-subtle)' }} />
            <div>
              <div style={{ fontSize: '0.85rem', color: '#94A3B8' }}>Percentage</div>
              <div
                style={{
                  fontSize: '2rem',
                  fontWeight: 800,
                  color: result.passed ? '#10B981' : '#F43F5E',
                }}
              >
                {result.percentage}%
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to={`/learn/${courseId}`} className="btn btn-primary" style={{ gap: '0.5rem' }}>
              <BookOpen size={16} />
              Return to Course
            </Link>
            <button
              onClick={() => setReviewMode(!reviewMode)}
              className="btn btn-secondary"
              style={{ gap: '0.5rem' }}
            >
              <HelpCircle size={16} />
              {reviewMode ? 'Hide Answers Review' : 'View Correct Answers Breakdown'}
            </button>
            <button onClick={handleRetake} className="btn btn-ghost" style={{ gap: '0.5rem' }}>
              <RotateCcw size={16} />
              Retake Assessment
            </button>
          </div>
        </div>

        {/* Detailed Answers Review Section */}
        {reviewMode && result.breakdown && (
          <div style={{ marginTop: '3rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Detailed Answer Review</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {result.breakdown.map((item, idx) => (
                <div
                  key={idx}
                  className="card"
                  style={{
                    padding: '1.5rem',
                    borderLeft: `4px solid ${item.isCorrect ? '#10B981' : '#F43F5E'}`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <span className={`badge ${item.isCorrect ? 'badge-emerald' : 'badge-rose'}`}>
                      {item.isCorrect ? 'Correct ✓' : 'Incorrect ✗'}
                    </span>
                    <span style={{ fontSize: '0.85rem', color: '#94A3B8' }}>Question {idx + 1}</span>
                  </div>

                  <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#FFFFFF' }}>
                    {item.questionText}
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                    {item.options.map((opt, oIdx) => {
                      const isCorrectAnswer = oIdx === item.correctAnswer;
                      const isUserSelection = oIdx === item.selectedOption;

                      let bg = 'rgba(255, 255, 255, 0.02)';
                      let border = 'var(--border-subtle)';
                      let color = '#CBD5E1';

                      if (isCorrectAnswer) {
                        bg = 'rgba(16, 185, 129, 0.15)';
                        border = 'rgba(16, 185, 129, 0.4)';
                        color = '#34D399';
                      } else if (isUserSelection && !item.isCorrect) {
                        bg = 'rgba(244, 63, 94, 0.15)';
                        border = 'rgba(244, 63, 94, 0.4)';
                        color = '#FB7185';
                      }

                      return (
                        <div
                          key={oIdx}
                          style={{
                            padding: '0.75rem 1rem',
                            borderRadius: 'var(--radius-sm)',
                            background: bg,
                            border: `1px solid ${border}`,
                            color,
                            fontSize: '0.9rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <span>{opt}</span>
                          {isCorrectAnswer && (
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#10B981' }}>
                              Correct Answer
                            </span>
                          )}
                          {isUserSelection && !isCorrectAnswer && (
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#F43F5E' }}>
                              Your Selection
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {item.explanation && (
                    <div
                      style={{
                        padding: '0.85rem',
                        background: 'rgba(99, 102, 241, 0.08)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.85rem',
                        color: '#C7D2FE',
                      }}
                    >
                      <strong>Explanation: </strong> {item.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Active Quiz Examination View
  return (
    <div style={{ padding: '3rem 0 6rem' }}>
      <div className="container-narrow">
        {/* Top Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '2rem',
          }}
        >
          <Link
            to={`/learn/${courseId}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: '#94A3B8',
              fontSize: '0.875rem',
              fontWeight: 600,
            }}
          >
            <ArrowLeft size={16} />
            Back to Course
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94A3B8', fontSize: '0.85rem' }}>
            <Award size={16} color="#818CF8" />
            <span>Passing Score: {quiz.passingScore}%</span>
          </div>
        </div>

        {/* Progress & Question Tracker */}
        <div style={{ marginBottom: '1.75rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.5rem',
              fontSize: '0.85rem',
              color: '#94A3B8',
            }}
          >
            <span>
              Question <strong style={{ color: '#FFFFFF' }}>{currentQuestionIndex + 1}</strong> of{' '}
              <strong style={{ color: '#FFFFFF' }}>{totalQuestions}</strong>
            </span>
            <span>{answeredCount} Answered</span>
          </div>
          <div className="progress-container" style={{ height: '6px' }}>
            <div
              className="progress-bar"
              style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="card glass-panel animate-fade-in" style={{ padding: '2.5rem', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.35rem', lineHeight: 1.4, marginBottom: '1.75rem', color: '#FFFFFF' }}>
            {currentQuestion?.questionText}
          </h2>

          {/* Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {currentQuestion?.options.map((option, idx) => {
              const isSelected = selectedAnswers[currentQuestion._id] === idx;

              return (
                <div
                  key={idx}
                  onClick={() => handleSelectOption(currentQuestion._id, idx)}
                  style={{
                    padding: '1.1rem 1.25rem',
                    borderRadius: 'var(--radius-md)',
                    background: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                    border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border-subtle)'}`,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  }}
                >
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      border: `2px solid ${isSelected ? 'var(--primary)' : '#64748B'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {isSelected && (
                      <div
                        style={{
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          background: 'var(--primary)',
                        }}
                      />
                    )}
                  </div>
                  <span
                    style={{
                      fontSize: '0.975rem',
                      color: isSelected ? '#FFFFFF' : '#CBD5E1',
                      fontWeight: isSelected ? 600 : 400,
                    }}
                  >
                    {option}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Navigation Buttons */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <button
            onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentQuestionIndex === 0}
            className="btn btn-secondary"
            style={{ gap: '0.4rem', opacity: currentQuestionIndex === 0 ? 0.35 : 1 }}
          >
            <ChevronLeft size={16} />
            Previous
          </button>

          {currentQuestionIndex < totalQuestions - 1 ? (
            <button
              onClick={() => setCurrentQuestionIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
              className="btn btn-primary"
              style={{ gap: '0.4rem' }}
            >
              Next Question
              <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="btn btn-gradient"
              style={{ gap: '0.5rem', padding: '0.85rem 1.75rem' }}
            >
              <Award size={18} />
              {submitting ? 'Grading Answers...' : 'Submit Assessment'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
