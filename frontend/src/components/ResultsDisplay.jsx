import { useState } from "react";
import "./ResultsDisplay.css";

const RISK_CONFIG = {
    "Safe": { color: "var(--green)", bg: "rgba(0,232,122,0.08)", icon: "✓", border: "rgba(0,232,122,0.25)" },
    "Adjust Dosage": { color: "var(--yellow)", bg: "rgba(255,201,64,0.08)", icon: "⚠", border: "rgba(255,201,64,0.25)" },
    "Toxic": { color: "var(--red)", bg: "rgba(255,77,106,0.08)", icon: "✕", border: "rgba(255,77,106,0.25)" },
    "Ineffective": { color: "#ff8c42", bg: "rgba(255,140,66,0.08)", icon: "⊘", border: "rgba(255,140,66,0.25)" },
    "Unknown": { color: "var(--text-dim)", bg: "rgba(90,122,154,0.08)", icon: "?", border: "rgba(90,122,154,0.25)" },
};

const SEV_COLORS = { none: "var(--green)", low: "var(--yellow)", moderate: "#ff8c42", high: "var(--red)", critical: "var(--red)" };

function RiskBadge({ label }) {
    const cfg = RISK_CONFIG[label] || RISK_CONFIG["Unknown"];
    return (
        <span className="risk-badge" style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}` }}>
            <span className="risk-icon">{cfg.icon}</span> {label}
        </span>
    );
}

function ResultCard({ result }) {
    const [expanded, setExpanded] = useState(false);
    const profile = result.pharmacogenomic_profile || {};
    const risk = result.risk_assessment || {};
    const rec = result.clinical_recommendation || {};
    const expl = result.llm_generated_explanation || {};
    const qm = result.quality_metrics || {};
    const riskCfg = RISK_CONFIG[risk.risk_label] || RISK_CONFIG["Unknown"];

    const downloadJSON = () => {
        const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = `pharma_${result.patient_id}_${result.drug}.json`; a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="result-card" style={{ borderColor: riskCfg.border }}>
            <div className="result-header" style={{ background: riskCfg.bg }}>
                <div className="result-header-left">
                    <span className="result-drug">{result.drug}</span>
                    <RiskBadge label={risk.risk_label} />
                </div>
                <div className="result-meta">
                    <span className="meta-item">Patient: <strong>{result.patient_id}</strong></span>
                    <span className="meta-item">Gene: <strong>{profile.primary_gene}</strong></span>
                </div>
            </div>

            <div className="metrics-row">
                <div className="metric"><span className="metric-label">Diplotype</span><span className="metric-value mono">{profile.diplotype}</span></div>
                <div className="metric"><span className="metric-label">Phenotype</span><span className="metric-value">{profile.phenotype}</span></div>
                <div className="metric"><span className="metric-label">Severity</span><span className="metric-value" style={{ color: SEV_COLORS[risk.severity] }}>{risk.severity}</span></div>
                <div className="metric"><span className="metric-label">Confidence</span><span className="metric-value">{((risk.confidence_score || 0) * 100).toFixed(0)}%</span></div>
            </div>

            <div className="conf-bar-wrap">
                <div className="conf-bar" style={{ width: `${(risk.confidence_score || 0) * 100}%`, background: riskCfg.color }} />
            </div>

            <div className="summary-box"><p className="summary-text">{expl.summary}</p></div>

            <div className="rec-box">
                <p className="rec-label">Clinical Recommendation</p>
                <p className="rec-text">{rec.recommendation}</p>
                {rec.contraindicated && <span className="contraindicated-badge">⛔ CONTRAINDICATED</span>}
            </div>

            <button className="expand-btn" onClick={() => setExpanded(!expanded)}>
                {expanded ? "Hide Details ↑" : "Show Full Analysis ↓"}
            </button>

            {expanded && (
                <div className="expanded-details">
                    {expl.mechanism && <div className="detail-section"><p className="detail-label">Biological Mechanism</p><p className="detail-text">{expl.mechanism}</p></div>}
                    {expl.clinical_implications && <div className="detail-section"><p className="detail-label">Clinical Implications</p><p className="detail-text">{expl.clinical_implications}</p></div>}
                    {expl.monitoring && <div className="detail-section"><p className="detail-label">Monitoring Parameters</p><p className="detail-text">{expl.monitoring}</p></div>}
                    <div className="detail-section"><p className="detail-label">CPIC Guideline</p><p className="detail-text">{rec.cpic_recommendation}</p></div>

                    {profile.detected_variants?.length > 0 && (
                        <div className="detail-section">
                            <p className="detail-label">Detected Variants</p>
                            <table className="variants-table">
                                <thead><tr><th>rsID</th><th>Gene</th><th>Star Allele</th><th>Position</th><th>Ref → Alt</th></tr></thead>
                                <tbody>
                                    {profile.detected_variants.map((v, i) => (
                                        <tr key={i}>
                                            <td className="mono">{v.rsid}</td><td>{v.gene}</td>
                                            <td className="mono">{v.star_allele}</td>
                                            <td className="mono">{v.chromosome}:{v.position}</td>
                                            <td className="mono">{v.ref_allele} → {v.alt_allele}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <div className="detail-section">
                        <p className="detail-label">Quality Metrics</p>
                        <div className="qm-grid">
                            <div className="qm-item"><span>VCF Parsed</span><span style={{ color: qm.vcf_parsing_success ? "var(--green)" : "var(--red)" }}>{qm.vcf_parsing_success ? "✓" : "✕"}</span></div>
                            <div className="qm-item"><span>Variants Found</span><span>{qm.total_variants_parsed}</span></div>
                            <div className="qm-item"><span>Gene Found</span><span style={{ color: qm.primary_gene_found ? "var(--green)" : "var(--yellow)" }}>{qm.primary_gene_found ? "✓" : "—"}</span></div>
                            <div className="qm-item"><span>Explanation By</span><span>{qm.explanation_source}</span></div>
                        </div>
                    </div>

                    <div className="actions-row">
                        <button className="action-btn download" onClick={downloadJSON}>↓ Download JSON</button>
                        <button className="action-btn copy" onClick={() => navigator.clipboard.writeText(JSON.stringify(result, null, 2))}>⧉ Copy JSON</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function ResultsDisplay({ results, onReset }) {
    return (
        <div className="results-wrap">
            <div className="results-header">
                <div>
                    <h2 className="results-title">Analysis Complete</h2>
                    <p className="results-sub">{results.length} drug{results.length !== 1 ? "s" : ""} analyzed · {results[0]?.patient_id}</p>
                </div>
                <button className="reset-btn" onClick={onReset}>← New Analysis</button>
            </div>
            <div className="results-list">
                {results.map((r, i) => <ResultCard key={i} result={r} />)}
            </div>
        </div>
    );
}