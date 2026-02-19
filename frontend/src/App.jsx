import { useState } from "react";
import FileUpload from "./components/FileUpload";
import DrugInput from "./components/DrugInput";
import ResultsDisplay from "./components/ResultsDisplay";
import LoadingSpinner from "./components/LoadingSpinner";
import "./App.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function App() {
    const [vcfFile, setVcfFile] = useState(null);
    const [drugs, setDrugs] = useState("");
    const [patientId, setPatientId] = useState("");
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleAnalyze = async () => {
        if (!vcfFile) { setError("Please upload a VCF file."); return; }
        if (!drugs.trim()) { setError("Please enter at least one drug name."); return; }
        if (!patientId.trim()) { setError("Please enter a Patient ID."); return; }
        setLoading(true); setError(null); setResults(null);
        try {
            const formData = new FormData();
            formData.append("drugs", drugs);
            formData.append("patient_id", patientId);
            formData.append("vcf_file", vcfFile);
            const response = await fetch(`${API_BASE}/analyze`, { method: "POST", body: formData });
            if (!response.ok) { const err = await response.json(); throw new Error(err.detail || "Analysis failed."); }
            const data = await response.json();
            setResults(data.results ? data.results : [data]);
        } catch (err) { setError(err.message); }
        finally { setLoading(false); }
    };

    const handleSample = async () => {
        if (!drugs.trim()) { setError("Please enter at least one drug name first."); return; }
        setLoading(true); setError(null); setResults(null);
        try {
            const formData = new FormData();
            formData.append("drugs", drugs);
            formData.append("patient_id", patientId || "PATIENT_DEMO");
            const response = await fetch(`${API_BASE}/analyze/sample`, { method: "POST", body: formData });
            if (!response.ok) { const err = await response.json(); throw new Error(err.detail || "Analysis failed."); }
            const data = await response.json();
            setResults(data.results ? data.results : [data]);
        } catch (err) { setError(err.message); }
        finally { setLoading(false); }
    };

    return (
        <div className="app">
            <header className="header">
                <div className="header-inner">
                    <div className="logo">
                        <span className="logo-icon">🧬</span>
                        <span className="logo-text">TechRx</span>
                    </div>
                    <span className="header-tag">PHARMACOGENOMIC RISK PREDICTION SYSTEM</span>
                </div>
            </header>

            <main className="main">
                {!results ? (
                    <div className="input-panel">
                        <div className="hero">
                            <h1 className="hero-title">
                                AI-powered Pharmacogenomic<br />
                                <span className="accent">Risk Prediction System</span>
                            </h1>
                            <p className="hero-sub">
                                Upload VCF file and enter drug name(s) for personalized risk assessment
                            </p>
                        </div>

                        <div className="card">
                            {/* Patient ID */}
                            <div className="field-group">
                                <label className="field-label">Patient ID <span className="required">*</span></label>
                                <input
                                    className="field-input"
                                    placeholder="e.g. PATIENT_001"
                                    value={patientId}
                                    onChange={(e) => setPatientId(e.target.value)}
                                />
                            </div>

                            {/* VCF Upload */}
                            <div className="field-group">
                                <label className="field-label">VCF File <span className="required">*</span></label>
                                <FileUpload file={vcfFile} onFileChange={setVcfFile} />
                            </div>

                            {/* Drug Input — no label here since DrugInput has its own */}
                            <div className="field-group">
                                <label className="field-label">Drug Name(s) <span className="required">*</span></label>
                                <input
                                    className="field-input"
                                    placeholder="e.g. CODEINE, WARFARIN, CLOPIDOGREL (comma-separated)"
                                    value={drugs}
                                    onChange={(e) => setDrugs(e.target.value)}
                                />
                                <p className="supported-text">Supported: CODEINE, CLOPIDOGREL, WARFARIN, SIMVASTATIN, AZATHIOPRINE, FLUOROURACIL</p>
                            </div>

                            {error && <div className="error-banner">⚠ {error}</div>}

                            <div className="btn-row">
                                <button className="analyze-btn" onClick={handleAnalyze} disabled={loading}>
                                    {loading ? "Analyzing..." : "Analyze VCF"}
                                </button>
                                <button className="sample-btn" onClick={handleSample} disabled={loading}>
                                    ⊡ Try Sample
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <ResultsDisplay results={results} onReset={() => setResults(null)} />
                )}
                {loading && <LoadingSpinner />}
            </main>

            <footer className="footer">
                <p>TechRx · RIFT 2026 Hackathon · For clinical decision support only.</p>
            </footer>
        </div>
    );
}
