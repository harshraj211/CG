"use client";
import type { MCQQuestion } from "@/types";

export function QuestionContext({ question }: { question: MCQQuestion }) {
  return question.context ? (
    <section className="question-context" aria-label="Question context">
      <h3>Scenario & given information</h3>
      <p>{question.context}</p>
    </section>
  ) : null;
}

export function AnswerExplanation({
  question: q,
  selected,
}: {
  question: MCQQuestion;
  selected?: number | null;
}) {
  return (
    <div className="explanation-content">
      <h3>Why this answer is correct</h3>
      <p>{q.explanation}</p>
      {q.optionExplanations && (
        <details className="option-explanations" open>
          <summary>Understand every option</summary>
          {q.options.map((option, i) => (
            <div
              key={i}
              className={`option-explanation ${i === q.correctAnswer ? "is-correct" : ""}`}
            >
              <div>
                <span className="tag neutral">
                  {i === q.correctAnswer
                    ? "Correct answer"
                    : selected === i
                      ? "Your selection"
                      : "Other option"}
                </span>
                <strong>{option}</strong>
              </div>
              <p>{q.optionExplanations?.[i]}</p>
            </div>
          ))}
        </details>
      )}
      {q.takeAway && (
        <div className="revision-takeaway">
          <strong>Remember for next time</strong>
          <p>{q.takeAway}</p>
        </div>
      )}
    </div>
  );
}
