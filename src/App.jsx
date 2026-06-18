import { useState } from "react";
import "./App.css";

function App() {
  const [mode, setMode] = useState("langdetect"); // default
  const [alignFormat, setAlignFormat] = useState("csv"); // default
  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);
  const [status, setStatus] = useState("");
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [langResult, setLangResult] = useState("");

  const api = (path) => `https://itpt-backend.onrender.com${path}`;
  
  const handleProcess = async () => {
    setStatus("Processing…");
    setDownloadUrl(null);
    setLangResult("");

    const formData = new FormData();
    formData.append("mode", mode);

    if (mode === "align" || mode === "bilingual_to_aligned") {
    formData.append("format", alignFormat);
  }


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

    // SPECIAL CASE: language detection → show text instead of download
    if (mode === "langdetect") {
      const text = await response.text();
      setLangResult(text);
      setStatus("Done");
      return;
    }

    // Other modes still download files
    const disposition = response.headers.get("Content-Disposition");
    let filename = "download";
    
    if (disposition && disposition.includes("filename=")) {
      filename = disposition.split("filename=")[1].replace(/"/g, "");
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    setDownloadUrl({ url, filename });
    setStatus("Done");

  };


  return (
    <div className="container">
      <h1>Irish Text Processing Tools</h1>
      NOTE: The process must be selected before uploading the file(s).
      If you change the process, please re-upload the file(s) to avoid errors.

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
          <option value="bilingual_to_aligned">Bilingual File Alignment</option>
        </select>

        {mode === "langdetect" && (
          <p>
            Detects the language of the uploaded text file. The language code will be displayed below.
          </p>
        )}

        {mode === "split" && (
          <p>
            Splits the uploaded text file into sentences. The output will be a
            text file with each sentence on a new line.
          </p>
        )}

        {mode === "align" && (
          <p>
            Aligns sentences from two uploaded text files. The output will be a
            text file with aligned sentence pairs.
          </p>
        )}

        {mode === "bilingual_to_aligned" && (
          <p>
            Takes a single bilingual text file (English and Irish) and aligns the sentences. The output will be a text file with aligned sentence pairs.
          </p>
        )}

        {mode === "align" && (
          <div style={{ marginTop: "10px" }}>
            <label>Output format: </label>
            <select
              value={alignFormat}
              onChange={(e) => setAlignFormat(e.target.value)}
            >
              <option value="csv">CSV</option>
              <option value="tmx">TMX</option>
            </select>
          </div>
        )}

        {mode === "bilingual_to_aligned" && (
          <div style={{ marginTop: "10px" }}>
            <label>Output format: </label>
            <select
              value={alignFormat}
              onChange={(e) => setAlignFormat(e.target.value)}
            >
              <option value="csv">CSV</option>
              <option value="tmx">TMX</option>
            </select>
          </div>
        )}



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

        {mode === "langdetect" && langResult && (
          <div style={{ marginTop: "20px", padding: "10px", border: "1px solid #ccc" }}>
            <strong>Detected Language:</strong>
            <pre>{langResult}</pre>
          </div>
        )}

        {downloadUrl && (
          <a
            href={downloadUrl.url}
            download={downloadUrl.filename}
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
