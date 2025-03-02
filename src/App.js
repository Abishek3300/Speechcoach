import { useState } from "react";

function App() {
  const [file, setFile] = useState(null);
  const [transcript, setTranscript] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [jobName, setJobName] = useState(""); // Store job name

  const API_BASE = "https://zcw6gt8i7g.execute-api.us-east-1.amazonaws.com";

  const uploadAudio = async () => {
    if (!file) {
      alert("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("user_id", "user123");

    try {
      const response = await fetch(`${API_BASE}/rapid-fire/`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.job_name) {
        setJobName(data.job_name);
        checkTranscriptionStatus(data.job_name);
      } else {
        console.error("Job name not returned:", data);
      }
    } catch (error) {
      console.error("Upload error:", error);
    }
  };

  const checkTranscriptionStatus = async (jobName) => {
    let status = "IN_PROGRESS";
    let transcriptUrl = "";

    while (status === "IN_PROGRESS") {
      try {
        const response = await fetch(
          `${API_BASE}/transcription-status/?job_name=${jobName}`
        );
        const data = await response.json();
        status = data.status;

        if (status === "COMPLETED") {
          transcriptUrl = data.transcript_url;
          analyzeTranscript(transcriptUrl);
          break;
        } else if (status === "FAILED") {
          console.error("Transcription failed:", data.error);
          break;
        }
      } catch (error) {
        console.error("Status check error:", error);
        break;
      }

      await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 sec before retrying
    }
  };

  const analyzeTranscript = async (transcriptUrl) => {
    try {
      const response = await fetch(
        `${API_BASE}/analyze-transcript/?transcript_url=${transcriptUrl}&time_taken=4.5`
      );
      const data = await response.json();
      setTranscript(data.transcript);
      setAnalysis(data);
    } catch (error) {
      console.error("Analysis error:", error);
    }
  };

  return (
    <div>
      <h1>AI-Powered Public Speaking Trainer</h1>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={uploadAudio}>Upload & Analyze</button>

      {transcript && (
        <div>
          <h2>Transcription:</h2>
          <p>{transcript}</p>
        </div>
      )}

      {analysis && (
        <div>
          <h2>Analysis:</h2>
          <p>Timing: {analysis.timing}</p>
          <p>Sentiment: {analysis.sentiment}</p>
          <p>Analogy Score: {analysis.analogy_score}</p>
        </div>
      )}
    </div>
  );
}

export default App;
