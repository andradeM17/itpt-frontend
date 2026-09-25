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
  const [textInput, setTextInput] = useState("");
  const [processSelected, setProcessSelected] = useState(false);
  const placeholderText = "Paste text here (optional)";


  // const api = (path) => `https://itpt-backend.onrender.com${path}`;
  const api = (path) => `http://localhost:5000${path}`;
  
  const handleProcess = async () => {
    setStatus("Processing…");
    setDownloadUrl(null);
    setLangResult("");

    const formData = new FormData();
    formData.append("mode", mode);

    if (mode !== "align" && mode !== "bilingual_to_aligned") {
      if (textInput.trim() !== "") {
        formData.append("text_input", textInput);
      }
      else if (file1) {
        formData.append("file1", file1);
      }
      else {
        setStatus("Please upload a file or paste text");
        return;
      }
    }
    if (mode === "bilingual_to_aligned") {
      if (!file1) {
        setStatus("Please upload a bilingual file for alignment");
        return;
      }
      else {
        formData.append("file1", file1);
      }
    }
    else {
      if (!file1 || !file2) {
        setStatus("Please upload both files for alignment");
        return;
      }
      else {
        formData.append("file1", file1);
        formData.append("file2", file2);
      }
    }

    if (mode === "align" || mode === "bilingual_to_aligned") {
      formData.append("format", alignFormat);
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
    setFile1(null);
    setFile2(null);
  };


  return (
    <div className="container">
      <h1>Irish Text Processing Tools</h1>
      NOTE: The process must be selected before uploading the file(s).
      If you change the process, please re-upload the file(s) to avoid errors.

      <section>
      <h2>1) Select Process</h2>

      <select
        value={mode}
        onChange={(e) => {
          setMode(e.target.value);
          setProcessSelected(false);
          setFile1(null);
          setFile2(null);
          setDownloadUrl(null);
          setStatus("");
          setLangResult("");
        }}
      >
        <option value="langdetect">Language Detection</option>
        <option value="split">Sentence Splitting</option>
        <option value="align">Sentence Alignment</option>
        <option value="bilingual_to_aligned">
          Bilingual File Alignment
        </option>
      </select>

      <button
        onClick={() => setProcessSelected(true)}
        style={{ marginLeft: "10px" }}
      >
        Select
      </button>

      {mode === "langdetect" && (
        <p>
          Detects the language of the uploaded text file. The language code
          will be displayed below.
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
          Takes a bilingual text file (English and Irish) and aligns the
          sentences. The output will be a text file with aligned sentence
          pairs.
        </p>
      )}

      {processSelected && mode === "align" && (
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

      {processSelected && mode === "bilingual_to_aligned" && (
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


    {processSelected && (
      <section>
        <h2>2) Upload File(s)</h2>

        <p>Main file:</p>
        <input
          type="file"
          multiple
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


        {mode !== "align" && mode !== "bilingual_to_aligned" && (
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              rows={6}
              style={{ width: "100%", marginBottom: "10px" }}
              placeholder={placeholderText}
            />
        )}

        <button onClick={handleProcess}>Run</button>

        <p>{status}</p>

        {mode === "langdetect" && langResult && (
          <div
            style={{
              marginTop: "20px",
              padding: "10px",
              border: "1px solid #ccc",
            }}
          >
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
    )}
    </div>
  );
}

export default App;
