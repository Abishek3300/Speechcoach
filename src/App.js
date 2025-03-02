import { useState } from "react";

function App() {
  const [file, setFile] = useState(null);
  const [transcript, setTranscript] = useState("");
  const [analysis, setAnalysis] = useState(null);

  const uploadAudio = async () => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("user_id", "user123");

    const response = await fetch("http://your-ec2-ip:8000/rapid-fire/", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    checkTranscriptionStatus(data.job_name);
  };

  const checkTranscriptionStatus = async (jobName) => {
    let status = "IN_PROGRESS";
    let transcriptUrl = "";

    while (status === "IN_PROGRESS") {
      const response = await fetch(
        `http://your-ec2-ip:8000/transcription-status/?job_name=${jobName}`
      );
      const data = await response.json();
      status = data.status;

      if (status === "COMPLETED") {
        transcriptUrl = data.transcript_url;
        analyzeTranscript(transcriptUrl);
      }

      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  };

  const analyzeTranscript = async (transcriptUrl) => {
    const response = await fetch(
      `http://your-ec2-ip:8000/analyze-transcript/?transcript_url=${transcriptUrl}&time_taken=4.5`
    );
    const data = await response.json();
    setTranscript(data.transcript);
    setAnalysis(data);
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
