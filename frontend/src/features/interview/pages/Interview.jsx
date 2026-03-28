import React, { useState } from "react";
import "../style/interview.scss";

// ── Mock Data ─────────────────────────────────────────────────────────────────
const REPORT = {
  matchScore: 88,
  technicalQuestions: [
    {
      question:
        "Explain the Node.js event loop and how it handles asynchronous I/O operations.",
      intention:
        "To assess the candidate's deep understanding of Node.js internal architecture and non-blocking I/O.",
      answer:
        "The candidate should explain the different phases of the event loop (timers, pending callbacks, idle/prepare, poll, check, close). They should mention how Libuv handles the thread pool and how the callback queue works with the call stack to ensure performance without blocking the main thread.",
    },
    {
      question:
        "How do you optimize a MongoDB aggregation pipeline for high-volume data?",
      intention:
        "To test practical experience with database performance and the candidate's claim of reducing response times by 35%.",
      answer:
        "Focus on using $match as early as possible to reduce the dataset, ensuring fields used in $match and $sort are indexed, and avoiding $unwind if possible as it inflates the document count. Mention the use of 'explain()' to analyze execution plans.",
    },
    {
      question:
        "Can you describe the Cache-Aside pattern and when you would use Redis in a Node.js application?",
      intention:
        "To evaluate the candidate's understanding of caching strategies, given their basic knowledge of Redis.",
      answer:
        "The candidate should explain that the application first checks the cache; if data is missing (cache miss), it fetches from the DB, stores it in the cache, and returns it. They should discuss TTL (Time to Live) and cache invalidation strategies to prevent stale data.",
    },
    {
      question:
        "What are the challenges of migrating a monolithic application to a modular service-based architecture?",
      intention:
        "To explore the candidate's experience with architectural changes and service boundaries.",
      answer:
        "Discuss data consistency across services, communication overhead (REST vs gRPC), service discovery, and the complexity of managing multiple deployments.",
    },
  ],
  behavioralQuestions: [
    {
      question:
        "Describe a time when you had to optimize a piece of code that was causing production delays. How did you identify the bottleneck?",
      intention:
        "To evaluate problem-solving skills and the use of monitoring/profiling tools.",
      answer:
        "The candidate should use the STAR method. They should mention using tools like Chrome DevTools, New Relic, or MongoDB Atlas Profiler, the specific metrics they looked at, and the measurable impact of their fix.",
    },
    {
      question:
        "How do you approach learning a new technology, such as your recent work with the Gemini API?",
      intention:
        "To assess adaptability and the ability to stay updated with industry trends.",
      answer:
        "The candidate should describe their process: reading official documentation, building a proof-of-concept, understanding the limitations, and eventually integrating it into a structured project.",
    },
  ],
  skillGaps: [
    { skill: "Message Queues (Kafka/RabbitMQ)", severity: "high" },
    { skill: "Advanced Docker & CI/CD Pipelines", severity: "medium" },
    { skill: "Distributed Systems Design", severity: "medium" },
    { skill: "Production-level Redis management", severity: "low" },
  ],
  preparationPlan: [
    {
      day: 1,
      focus: "Node.js Internals & Streams",
      tasks: [
        "Deep dive into the Event Loop phases and process.nextTick vs setImmediate.",
        "Practice implementing Node.js Streams for handling large data sets.",
      ],
    },
    {
      day: 2,
      focus: "Advanced MongoDB & Indexing",
      tasks: [
        "Study Compound Indexes, TTL Indexes, and Text Indexes.",
        "Practice writing complex Aggregation pipelines and using the .explain('executionStats') method.",
      ],
    },
    {
      day: 3,
      focus: "Caching & Redis Strategies",
      tasks: [
        "Read about Redis data types beyond strings (Sets, Hashes, Sorted Sets).",
        "Implement a Redis-based rate limiter or a caching layer for a sample API.",
      ],
    },
    {
      day: 4,
      focus: "System Design & Microservices",
      tasks: [
        "Study Microservices communication patterns (Synchronous vs Asynchronous).",
        "Learn about the API Gateway pattern and Circuit Breakers.",
      ],
    },
    {
      day: 5,
      focus: "Message Queues & DevOps Basics",
      tasks: [
        "Watch introductory tutorials on RabbitMQ or Kafka.",
        "Dockerize a project and write a simple GitHub Actions workflow for CI.",
      ],
    },
    {
      day: 6,
      focus: "Data Structures & Algorithms",
      tasks: [
        "Solve 5-10 Medium LeetCode problems focusing on Arrays, Strings, and Hash Maps.",
        "Review common sorting and searching algorithms.",
      ],
    },
    {
      day: 7,
      focus: "Mock Interview & Project Review",
      tasks: [
        "Conduct a mock interview focusing on explaining the Real-time Chat Application architecture.",
        "Prepare concise summaries for all work experience bullets.",
      ],
    },
  ],
};

const NAV_ITEMS = [
  {
    id: "technical",
    label: "Technical Questions",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
  },
  {
    id: "behavioral",
    label: "Behavioral Questions",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    id: "roadmap",
    label: "Road Map",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polygon points="3 11 22 2 13 21 11 13 3 11" />
      </svg>
    ),
  },
];

// ── Sub-components ────────────────────────────────────────────────────────────
const QuestionCard = ({ item, index }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="q-card">
      <div className="q-card__header" onClick={() => setOpen((o) => !o)}>
        <span className="q-card__index">Q{index + 1}</span>
        <p className="q-card__question">{item.question}</p>
        <span
          className={`q-card__chevron ${open ? "q-card__chevron--open" : ""}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </div>
      {open && (
        <div className="q-card__body">
          <div className="q-card__section">
            <span className="q-card__tag q-card__tag--intention">
              Intention
            </span>
            <p>{item.intention}</p>
          </div>
          <div className="q-card__section">
            <span className="q-card__tag q-card__tag--answer">
              Model Answer
            </span>
            <p>{item.answer}</p>
          </div>
        </div>
      )}
    </div>
  );
};

const RoadMapDay = ({ day }) => (
  <div className="roadmap-day">
    <div className="roadmap-day__header">
      <span className="roadmap-day__badge">Day {day.day}</span>
      <h3 className="roadmap-day__focus">{day.focus}</h3>
    </div>
    <ul className="roadmap-day__tasks">
      {day.tasks.map((task, i) => (
        <li key={i}>
          <span className="roadmap-day__bullet" />
          {task}
        </li>
      ))}
    </ul>
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────
const Interview = () => {
  const [activeNav, setActiveNav] = useState("technical");

  const scoreColor =
    REPORT.matchScore >= 80
      ? "score--high"
      : REPORT.matchScore >= 60
        ? "score--mid"
        : "score--low";

  return (
    <div className="interview-page">
      <div className="interview-layout">
        {/* ── Left Nav ── */}
        <nav className="interview-nav">
          <p className="interview-nav__label">Sections</p>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              className={`interview-nav__item ${activeNav === item.id ? "interview-nav__item--active" : ""}`}
              onClick={() => setActiveNav(item.id)}
            >
              <span className="interview-nav__icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="interview-divider" />

        {/* ── Center Content ── */}
        <main className="interview-content">
          {activeNav === "technical" && (
            <section>
              <div className="content-header">
                <h2>Technical Questions</h2>
                <span className="content-header__count">
                  {REPORT.technicalQuestions.length} questions
                </span>
              </div>
              <div className="q-list">
                {REPORT.technicalQuestions.map((q, i) => (
                  <QuestionCard key={i} item={q} index={i} />
                ))}
              </div>
            </section>
          )}

          {activeNav === "behavioral" && (
            <section>
              <div className="content-header">
                <h2>Behavioral Questions</h2>
                <span className="content-header__count">
                  {REPORT.behavioralQuestions.length} questions
                </span>
              </div>
              <div className="q-list">
                {REPORT.behavioralQuestions.map((q, i) => (
                  <QuestionCard key={i} item={q} index={i} />
                ))}
              </div>
            </section>
          )}

          {activeNav === "roadmap" && (
            <section>
              <div className="content-header">
                <h2>Preparation Road Map</h2>
                <span className="content-header__count">
                  {REPORT.preparationPlan.length}-day plan
                </span>
              </div>
              <div className="roadmap-list">
                {REPORT.preparationPlan.map((day) => (
                  <RoadMapDay key={day.day} day={day} />
                ))}
              </div>
            </section>
          )}
        </main>

        <div className="interview-divider" />

        {/* ── Right Sidebar ── */}
        <aside className="interview-sidebar">
          {/* Match Score */}
          <div className="match-score">
            <p className="match-score__label">Match Score</p>
            <div className={`match-score__ring ${scoreColor}`}>
              <span className="match-score__value">{REPORT.matchScore}</span>
              <span className="match-score__pct">%</span>
            </div>
            <p className="match-score__sub">Strong match for this role</p>
          </div>

          <div className="sidebar-divider" />

          {/* Skill Gaps */}
          <div className="skill-gaps">
            <p className="skill-gaps__label">Skill Gaps</p>
            <div className="skill-gaps__list">
              {REPORT.skillGaps.map((gap, i) => (
                <span
                  key={i}
                  className={`skill-tag skill-tag--${gap.severity}`}
                >
                  {gap.skill}
                </span>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Interview;
