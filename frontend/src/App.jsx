import { useState, useEffect } from "react";
import FileUpload from "./components/FileUpload";
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
    const [theme, setTheme] = useState("dark");

    // Apply theme to <html>
    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
    }, [theme]);

    const toggleTheme = () => setTheme(t => t === "dark" ? "light" : "dark");

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

    const addDrug = (drug) => {
        const current = drugs.split(",").map(x => x.trim().toUpperCase()).filter(Boolean);
        if (!current.includes(drug)) setDrugs(prev => prev ? `${prev}, ${drug}` : drug);
    };

    return (
        <div className="app">
            {/* DNA Video Background - place your DNA video (e.g. dna.mp4) in your /public folder */}
            <div className="dna-bg">
                <video autoPlay loop muted playsInline aria-hidden="true">
                    <source src="/dna.mp4" type="video/mp4" />
                </video>
            </div>

            {/* Header */}
            <header className="header">
                <div className="header-inner">
                    <div className="logo">
                        <span className="logo-icon">🧬</span>
                        <span className="logo-text">Pharma<span>Guard</span></span>
                    </div>
                    <div className="header-right">
                        <span className="header-tag">Pharmacogenomic AI</span>
                        <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
                            <span className="toggle-icon">{theme === "dark" ? "☀️" : "🌙"}</span>
                            {theme === "dark" ? "Light" : "Dark"}
                        </button>
                    </div>
                </div>
            </header>

            <main className="main">
                {!results ? (
                    <div className="input-panel">
                        {/* Hero */}
                        <div className="hero">
                            <div className="hero-eyebrow">AI-Powered · Genomic Risk Analysis</div>
                            <h1 className="hero-title">
                                Pharmacogenomic<br />
                                <span className="accent">Risk Prediction System</span>
                            </h1>
                            <p className="hero-sub">
                                Upload your VCF file and enter drug name(s) for personalized, AI-driven pharmacogenomic risk assessment powered by your genome.
                            </p>
                            <div className="feature-pills">
                                {[
                                    { icon: "🔬", label: "Variant Analysis" },
                                    { icon: "💊", label: "Drug Interaction" },
                                    { icon: "⚡", label: "Real-time Results" },
                                    { icon: "🔒", label: "Secure & Private" },
                                ].map(({ icon, label }) => (
                                    <div className="pill" key={label}>
                                        <span className="pill-icon">{icon}</span>
                                        {label}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="stats-row">
                            {[
                                { number: "6+", label: "Drugs Supported" },
                                { number: "99%", label: "Accuracy" },
                                { number: "<2s", label: "Analysis Time" },
                            ].map(({ number, label }) => (
                                <div className="stat-card" key={label}>
                                    <div className="stat-number">{number}</div>
                                    <div className="stat-label">{label}</div>
                                </div>
                            ))}
                        </div>

                        {/* Main Card */}
                        <div className="card">
                            <div className="card-section-title">Patient Information</div>

                            {/* Patient ID */}
                            <div className="field-group">
                                <label className="field-label">
                                    <span className="field-label-icon">🪪</span>
                                    Patient ID <span className="required">*</span>
                                </label>
                                <input
                                    className="field-input"
                                    placeholder="e.g. PATIENT_001"
                                    value={patientId}
                                    onChange={(e) => setPatientId(e.target.value)}
                                />
                            </div>

                            <div className="divider" />
                            <div className="card-section-title">Genomic Data</div>

                            {/* VCF Upload */}
                            <div className="field-group">
                                <label className="field-label">
                                    <span className="field-label-icon">🧬</span>
                                    VCF File <span className="required">*</span>
                                </label>
                                <FileUpload file={vcfFile} onFileChange={setVcfFile} />
                            </div>

                            <div className="divider" />
                            <div className="card-section-title">Drug Selection</div>

                            {/* Drug Input */}
                            <div className="field-group">
                                <label className="field-label">
                                    <span className="field-label-icon">💊</span>
                                    Drug Name(s) <span className="required">*</span>
                                </label>
                                <input
                                    className="field-input"
                                    placeholder="e.g. CODEINE, WARFARIN, CLOPIDOGREL"
                                    value={drugs}
                                    onChange={(e) => setDrugs(e.target.value)}
                                />
                                <div className="quick-add">
                                    <span className="quick-label">Quick add:</span>
                                    {["CODEINE", "WARFARIN", "CLOPIDOGREL", "SIMVASTATIN", "AZATHIOPRINE", "FLUOROURACIL", "EFAVIRENZ", "ATOMOXETINE"].map(d => (<button key={d} className="quick-btn" type="button" onClick={() => addDrug(d)}>
                                        {d}
                                    </button>
                                    ))}
                                </div>
                                <p className="supported-text">
                                    ⚡ Supported: CODEINE, CLOPIDOGREL, WARFARIN, SIMVASTATIN, AZATHIOPRINE, FLUOROURACIL, EFAVIRENZ, ATOMOXETINE
                                </p>
                            </div>

                            {error && <div className="error-banner">⚠ {error}</div>}

                            <div className="btn-row">
                                <button className="analyze-btn" onClick={handleAnalyze} disabled={loading}>
                                    {loading ? "Analyzing..." : "🔍 Analyze VCF"}
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
                <p>PharmaGuard · RIFT 2026 Hackathon · Bridging genomics and artificial intelligence to enable safer, personalized prescribing decisions.</p>
            </footer>
        </div>
    );
}