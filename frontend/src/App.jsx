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
    const [apiKey, setApiKey] = useState("");
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [useSample, setUseSample] = useState(false);

    const handleAnalyze = async () => {
        if (!useSample && !vcfFile) { setError("Please upload a VCF file or use sample data."); return; }
        if (!drugs.trim()) { setError("Please enter at least one drug name."); return; }
        setLoading(true); setError(null); setResults(null);
        try {
            const formData = new FormData();
            formData.append("drugs", drugs);
            if (patientId) formData.append("patient_id", patientId);
            if (apiKey) formData.append("openai_api_key", apiKey);
            let endpoint;
            if (useSample) { endpoint = `${API_BASE}/analyze/sample`; }
            else { endpoint = `${API_BASE}/analyze`; formData.append("vcf_file", vcfFile); }
            const response = await fetch(endpoint, { method: "POST", body: formData });
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
                    <div className="logo"><span className="logo-icon">⬡</span><span className="logo-text">PharmaGuard</span></div>
                    <p className="tagline">Pharmacogenomic Risk Prediction System</p>
                </div>
            </header>
            <main className="main">
                {!results ? (
                    <div className="input-panel">
                        <div className="hero">
                            <h1 className="hero-title">Know Your <span className="accent">Genetic Risk</span><br />Before You Prescribe</h1>
                            <p className="hero-sub">Upload a patient VCF file and enter drug names to receive AI-powered pharmacogenomic risk assessments aligned with CPIC guidelines.</p>
                        </div>
                        <div className="card">
                            <div className="sample-toggle">
                                <label className="toggle-label">
                                    <input type="checkbox" checked={useSample} onChange={(e) => setUseSample(e.target.checked)} className="toggle-check" />
                                    <span className="toggle-text">Use sample VCF for demo</span>
                                </label>
                            </div>
                            {!useSample && <FileUpload file={vcfFile} onFileChange={setVcfFile} />}
                            {useSample && (
                                <div className="sample-badge"><span className="badge-icon">🧬</span><span>Using built-in sample VCF (CYP2D6, CYP2C19, CYP2C9, SLCO1B1, TPMT, DPYD)</span></div>
                            )}
                            <DrugInput value={drugs} onChange={setDrugs} />
                            <div className="optional-fields">
                                <div className="field-group">
                                    <label className="field-label">Patient ID (optional)</label>
                                    <input className="field-input" placeholder="e.g. PATIENT_001" value={patientId} onChange={(e) => setPatientId(e.target.value)} />
                                </div>
                                <div className="field-group">
                                    <label className="field-label">OpenAI API Key (optional)</label>
                                    <input className="field-input" type="password" placeholder="sk-..." value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
                                </div>
                            </div>
                            {error && <div className="error-banner"><span>⚠ {error}</span></div>}
                            <button className="analyze-btn" onClick={handleAnalyze} disabled={loading}>
                                {loading ? "Analyzing..." : "Analyze Pharmacogenomic Risk"}
                            </button>
                        </div>
                        <div className="supported-drugs">
                            <p className="supported-label">Supported Drugs:</p>
                            <div className="drug-pills">
                                {["CODEINE", "WARFARIN", "CLOPIDOGREL", "SIMVASTATIN", "AZATHIOPRINE", "FLUOROURACIL"].map(d => (
                                    <span key={d} className="drug-pill" onClick={() => setDrugs(prev => prev ? `${prev}, ${d}` : d)}>{d}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <ResultsDisplay results={results} onReset={() => setResults(null)} />
                )}
                {loading && <LoadingSpinner />}
            </main>
            <footer className="footer"><p>PharmaGuard · RIFT 2026 Hackathon · Not a substitute for professional medical judgment.</p></footer>
        </div>
    );
}