### WRITTEN BY CO-PILOT ###

---

# **README — React Frontend for Text Processing & Alignment Tools**

This React application provides a user interface for interacting with the Flask backend API that performs:

- Language detection  
- Sentence splitting  
- Sentence alignment  
- Bilingual mixed‑file alignment (English ↔ Irish)  
- CSV/TMX downloads  
- ZIP downloads (alignment + failed lines)

The frontend is built with **React + Vite**, and communicates with the backend via `fetch()`.

---

## **Features**

### **1. Language Detection**
Upload a text file → the UI displays the detected language directly on the page (no download).

### **2. Sentence Splitting**
Upload a text file → download a `.txt` file containing one sentence per line.

### **3. Sentence Alignment**
Upload **two files** (source + target) → download:

- `alignment.csv`  
- `alignment.tmx`  

depending on the selected format.

### **4. Bilingual Mixed‑File Alignment**
Upload **files** (.txt, .docx or .pdf)  containing English + Irish mixed together → download:

- `bilingual_alignment.csv` or `.tmx`  
- `failed_lines.txt`  
- packaged together in a ZIP

---

## **Project Structure**

```
src/
  App.jsx
  api.js
  components/
    FileUpload.jsx
    ModeSelector.jsx
    DownloadLink.jsx
  styles/
    ...
public/
index.html
```

Key logic lives in:

- `App.jsx` — main UI and state management  
- `handleProcess()` — sends files + mode to backend  
- `DownloadLink` — renders the download button using the backend filename  

---

## **How the Frontend Communicates with the Backend**

### **POST /process**

All processing modes use the same endpoint:

```js
const response = await fetch(api("/process"), {
  method: "POST",
  body: formData,
});
```

The frontend sends:

| Field | Description |
|-------|-------------|
| `mode` | One of: `langdetect`, `split`, `align`, `bilingual_to_aligned` |
| `format` | `csv` or `tmx` (align + bilingual modes) |
| `file1` | Required for all modes |
| `file2` | Required only for `align` |

The backend responds with:

- Plain text (langdetect, split)  
- CSV/TMX file  
- ZIP file (bilingual mode)

The frontend extracts the filename from:

```js
const disposition = response.headers.get("Content-Disposition");
```

and uses it for the download link.

---

## **Download Handling**

The frontend creates a Blob URL:

```js
const blob = await response.blob();
const url = window.URL.createObjectURL(blob);
setDownloadUrl({ url, filename });
```

The download link uses the backend filename:

```jsx
<a href={downloadUrl.url} download={downloadUrl.filename}>
  Download Processed File
</a>
```

This ensures:

- CSV downloads as `.csv`
- TMX downloads as `.tmx`
- ZIP downloads as `.zip`
- No more `output.txt` issues

---

## **Running the Frontend**

### **Install dependencies**

```
npm install
```

### **Start development server**

```
npm run dev
```

The app runs at:

```
http://localhost:5173
```

Make sure the backend is running at the URL defined in `api.js`.

---

## **Configuration**

### **Backend URL**

Located in `src/api.js`:

```js
export const api = (path) => `http://localhost:5000${path}`;
```

Change this when deploying to Render or another host.

---

## **Supported Modes (UI)**

| Mode | Description | Inputs | Output |
|------|-------------|--------|--------|
| Language Detection | Detects language | 1 file | Text shown in UI |
| Sentence Split | Splits into sentences | 1 file | `.txt` |
| Sentence Alignment | Aligns two files | 2 files | `.csv` or `.tmx` |
| Bilingual → Aligned | Mixed English/Irish → aligned | 1 file | `.zip` |

---

## **Adding New Modes**

To add a new processing mode:

1. Add the mode to the `<select>` in the UI  
2. Add any required inputs (file2, format dropdown, etc.)  
3. Update `handleProcess()` to send the correct fields  
4. Update the backend `/process` route  

The system is designed to make new modes easy to plug in.

---