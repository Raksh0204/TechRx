import { useRef, useState } from "react";
import "./FileUpload.css";
export default function FileUpload({ file, onFileChange }) {
    const inputRef = useRef();
    const [dragging, setDragging] = useState(false);
    const handleFile = (f) => { if (f && f.name.endsWith(".vcf")) { onFileChange(f); } else if (f) { alert("Only .vcf files supported."); } };
    return (
        <div className={`file-upload ${dragging ? "dragging" : ""} ${file ? "has-file" : ""}`}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
            onClick={() => inputRef.current.click()}>
            <input ref={inputRef} type="file" accept=".vcf" style={{ display: "none" }} onChange={(e) => handleFile(e.target.files[0])} />
            {file ? (
                <div className="file-info">
                    <span className="file-icon">🧬</span>
                    <div><p className="file-name">{file.name}</p><p className="file-size">{(file.size / 1024).toFixed(1)} KB</p></div>
                    <button className="file-clear" onClick={(e) => { e.stopPropagation(); onFileChange(null); }}>✕</button>
                </div>
            ) : (
                <div className="file-placeholder">
                    <div className="upload-icon">↑</div>
                    <p className="upload-text">Drop your <strong>.vcf file</strong> here</p>
                    <p className="upload-sub">or click to browse · Max 5MB</p>
                </div>
            )}
        </div>
    );
}