import { useState } from "react";
import "./App.css";

function App() {
  const [mode, setMode] = useState("langdetect"); // default
  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);
  const [status, setStatus] = useState("");
  const [downloadUrl, setDownloadUrl] = useState(null);

  const api = (path) => `http://localhost:5000${path}`;

  const handleProcess = async () => {
    setStatus("Processing…");
    setDownloadUrl(null);

    const formData = new FormData();
    formData.append("mode", mode);

    if (!file1) {
      setStatus("Please upload the required file(s)");
      return;
    }

    formData.append("file1", file1);

    if (mode === "align") {
      if (!file2) {
        setStatus("Sentence alignment requires two files");
        return;
      }
      formData.append("file2", file2);
    }

    const response = await fetch(api("/process"), {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      setStatus("Error processing file");
      return;
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    setDownloadUrl(url);
    setStatus("Done");
  };

  return (
    <div className="container">
      <h1>Text Processing Tools</h1>

      <section>
        <h2>1)  Select Process</h2>

        <select
          value={mode}
          onChange={(e) => {
            setMode(e.target.value);
            setFile1(null);
            setFile2(null);
            setDownloadUrl(null);
            setStatus("");
          }}
        >
          <option value="langdetect">Language Detection</option>
          <option value="split">Sentence Splitting</option>
          <option value="align">Sentence Alignment</option>
        </select>
      </section>

      <section>
        <h2>2)  Upload File(s)</h2>

        <p>Main file:</p>
        <input
          type="file"
          onChange={(e) => setFile1(e.target.files[0])}
        />

        {mode === "align" && (
          <>
            <p>Second file (target language):</p>
            <input
              type="file"
              onChange={(e) => setFile2(e.target.files[0])}
            />
          </>
        )}

        <button onClick={handleProcess}>Run</button>

        <p>{status}</p>

        {downloadUrl && (
          <a
            href={downloadUrl}
            download={`processed_output.txt`}
            style={{ display: "block", marginTop: "20px" }}
          >
            ⬇️ Download Processed File
          </a>
        )}
      </section>
    </div>
  );
}

export default App;
