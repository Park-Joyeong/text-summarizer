import { useState } from "react";
import "./App.css";

const API_BASE_URL = "http://127.0.0.1:8000";

function App() {
  const [text, setText] = useState(""); // 입력 텍스트
  const [summary, setSummary] = useState(""); // 요약 결과
  const [loading, setLoading] = useState(false); // 로딩 상태
  const [error, setError] = useState(""); // 에러 메시지

  const exampleText =
    "과거를 떠올려보자. 방송을 보던 우리의 모습을. 독보적인 매체는 TV였다. 온 가족이 둘러앉아 TV를 봤다. 간혹 가족들끼리 뉴스와 드라마, 예능 프로그램을 둘러싸고 리모컨 쟁탈전이 벌어지기도 했다. 각자 선호하는 프로그램을 본방으로 보기 위한 싸움이었다. TV가 한 대인지 두 대인지 여부도 그래서 중요했다. 지금은 어떤가. 안방극장이라는 말은 옛말이 됐다. TV가 없는 집도 많다. 미디어의 혜택을 누릴 수 있는 방법은 늘어났다. 각자의 방에서 각자의 휴대폰으로, 노트북으로, 태블릿으로 콘텐츠를 즐긴다.";

  const handleExample = () => {
    setText(exampleText);
    setSummary("");
    setError("");
  };

  const handleSummarize = async () => {
    if (!text.trim()) {
      setError("요약할 텍스트를 입력해주세요.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSummary("");

      const response = await fetch(`${API_BASE_URL}/summarize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "요약 요청에 실패했습니다.");
      }

      setSummary(data.summary);
    } catch (err) {
      setError(err.message || "알 수 없는 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>한국어 요약기</h1>
        <p style={styles.desc}>
          React + FastAPI + KoBART로 만든 첫 번째 AI 기능
        </p>

        <textarea
          style={styles.textarea}
          placeholder="긴 문장을 붙여넣으세요."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <div style={styles.buttonRow}>
          <button style={styles.subButton} onClick={handleExample}>
            예시 넣기
          </button>
          <button
            style={styles.mainButton}
            onClick={handleSummarize}
            disabled={loading}
          >
            {loading ? "요약 중..." : "요약하기"}
          </button>
        </div>

        {error && <p style={styles.error}>{error}</p>}

        <div style={styles.resultBox}>
          <h2 style={styles.resultTitle}>결과</h2>
          {summary ? (
            <p style={styles.resultText}>{summary}</p>
          ) : (
            <p style={styles.placeholder}>아직 요약 결과가 없습니다.</p>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f5f7fb",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "24px",
    boxSizing: "border-box",
  },
  card: {
    width: "100%",
    maxWidth: "900px",
    background: "#ffffff",
    borderRadius: "18px",
    padding: "28px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
  },
  title: {
    margin: 0,
    marginBottom: "8px",
    fontSize: "32px",
    color: "#0f172a",
  },
  desc: {
    marginTop: 0,
    marginBottom: "20px",
    color: "#555",
  },
  textarea: {
    width: "100%",
    minHeight: "220px",
    padding: "16px",
    fontSize: "16px",
    borderRadius: "12px",
    border: "1px solid #d7dce5",
    boxSizing: "border-box",
    resize: "vertical",
  },
  buttonRow: {
    display: "flex",
    gap: "12px",
    marginTop: "16px",
  },
  mainButton: {
    padding: "12px 18px",
    borderRadius: "10px",
    border: "none",
    background: "#2563eb",
    color: "#fff",
    fontSize: "15px",
    cursor: "pointer",
  },
  subButton: {
    padding: "12px 18px",
    borderRadius: "10px",
    border: "1px solid #cbd5e1",
    background: "#fff",
    fontSize: "15px",
    cursor: "pointer",
    color: "#2563eb",
  },
  error: {
    marginTop: "14px",
    color: "#dc2626",
  },
  resultBox: {
    marginTop: "24px",
    padding: "18px",
    background: "#f8fafc",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
  },
  resultTitle: {
    marginTop: 0,
    marginBottom: "12px",
    fontSize: "20px",
    color: "#0f172a",
  },
  resultText: {
    margin: 0,
    lineHeight: 1.7,
    whiteSpace: "pre-wrap",
  },
  placeholder: {
    margin: 0,
    color: "#777",
  },
};

export default App;
