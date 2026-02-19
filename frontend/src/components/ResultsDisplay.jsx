import { useState } from "react";
import "./ResultsDisplay.css";

// PS REQUIREMENT: Green=Safe, Yellow=Adjust, Red=Toxic/Ineffective
const RISK_CONFIG = {
    "Safe": { color: "#00e87a", bg: "rgba(0,232,122,0.08)", border: "rgba(0,232,122,0.3)", label_bg: "rgba(0,232,122,0.15)", icon: "✓" },
    "Adjust Dosage": { color: "#ffc940", bg: "rgba(255,201,64,0.08)", border: "rgba(255,201,64,0.3)", label_bg: "rgba(255,201,64,0.15)", icon: "⚠" },
    "Toxic": { color: "#ff4d6a", bg: "rgba(255,77,106,0.08)", border: "rgba(255,77,106,0.3)", label_bg: "rgba(255,77,106,0.15)", icon: "✕" },
    "Ineffective": { color: "#ff4d6a", bg: "rgba(255,77,106,0.08)", border: "rgba(255,77,106,0.3)", label_bg: "rgba(255,77,106,0.15)", icon: "✕" },
    "Unknown": { color: "#5a7a9a", bg: "rgba(90,122,154,0.08)", border: "rgba(90,122,154,0.3)", label_bg: "rgba(90,122,154,0.15)", icon: "?" },
};

const SEV_COLORS = {
    none: "#00e87a", low: "#ffc940", moderate: "#ffc940", high: "#ff4d6a", critical: "#ff4d6a",
};

const TABS = [
    { id: "mechanism", label: "🔬 Mechanism" },
    { id: "implications", label: "🏥 Implications" },
    { id: "monitoring", label: "📋 Monitoring" },
    { id: "cpic", label: "📖 CPIC" },
    { id: "variants", label: "🧬 Variants" },
    { id: "quality", label: "✅ Quality" },
];

function RiskBadge({ label }) {
    const cfg = RISK_CONFIG[label] || RISK_CONFIG["Unknown"];
    return (
        <span className="risk-badge" style={{ color: cfg.color, background: cfg.label_bg, border: `1.5px solid ${cfg.border}` }}>
            <span className="risk-icon">{cfg.icon}</span>{label}
        </span>
    );
}

function ResultCard({ result }) {
    const [expanded, setExpanded] = useState(false);
    const [activeTab, setActiveTab] = useState("mechanism");
    const [copied, setCopied] = useState(false);

    const profile = result.pharmacogenomic_profile || {};
    const risk = result.risk_assessment || {};
    const rec = result.clinical_recommendation || {};
    const expl = result.llm_generated_explanation || {};
    const qm = result.quality_metrics || {};

    const cfg = RISK_CONFIG[risk.risk_label] || RISK_CONFIG["Unknown"];
    const sevColor = SEV_COLORS[risk.severity] || "#5a7a9a";
    const score = (risk.confidence_score || 0) * 100;

    const downloadJSON = () => {
        const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = `pharma_${result.patient_id}_${result.drug}.json`; a.click();
        URL.revokeObjectURL(url);
    };

    const copyJSON = () => {
        navigator.clipboard.writeText(JSON.stringify(result, null, 2));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const availableTabs = TABS.filter(t => {
        if (t.id === "mechanism") return !!expl.mechanism;
        if (t.id === "implications") return !!expl.clinical_implications;
        if (t.id === "monitoring") return !!expl.monitoring;
        if (t.id === "cpic") return !!rec.cpic_recommendation;
        if (t.id === "variants") return profile.detected_variants?.length > 0;
        if (t.id === "quality") return true;
        return false;
    });

    return (
        <div className="result-card" style={{ "--risk-color": cfg.color, "--risk-border": cfg.border }}>

            {/* ── Hero ── */}
            <div className="card-hero">
                <div className="hero-left">
                    <div className="hero-eyebrow">
                        <span className="eyebrow-dot" style={{ background: cfg.color }} />
                        {result.patient_id} · {profile.primary_gene}
                    </div>
                    <h2 className="hero-drug">{result.drug}</h2>
                    <RiskBadge label={risk.risk_label} />
                    <p className="hero-summary">{expl.summary}</p>
                </div>

                {/* RIGHT: Severity only (confidence removed per PS) */}
                <div className="hero-right">
                    <div className="stat-box" style={{ borderColor: `${sevColor}44` }}>
                        <div className="stat-big" style={{ color: sevColor }}>
                            {risk.severity ? risk.severity.charAt(0).toUpperCase() + risk.severity.slice(1) : "—"}
                        </div>
                        <span className="stat-tag" style={{ color: sevColor, background: `${sevColor}18`, border: `1px solid ${sevColor}44` }}>
                            Severity Level
                        </span>
                        <p className="stat-desc">Clinical severity of the pharmacogenomic interaction for this patient.</p>
                    </div>
                </div>
            </div>

            {/* ── Metrics strip: Diplotype, Phenotype, Primary Gene, Variants ── */}
            <div className="metrics-strip">
                {[
                    { label: "Diplotype", value: profile.diplotype, mono: true },
                    { label: "Phenotype", value: profile.phenotype, mono: false },
                    { label: "Primary Gene", value: profile.primary_gene, mono: true },
                    { label: "Variants", value: profile.detected_variants?.length ?? "—", mono: false },
                ].map(({ label, value, mono }) => (
                    <div className="strip-item" key={label}>
                        <span className="strip-label">{label}</span>
                        <span className={`strip-value${mono ? " mono" : ""}`}>{value}</span>
                    </div>
                ))}
            </div>

            {/* ── Risk-colored confidence bar ── */}
            <div className="conf-bar-wrap">
                <div className="conf-bar" style={{ width: `${score}%`, background: cfg.color, boxShadow: `0 0 10px ${cfg.color}` }} />
            </div>

            {/* ── Recommendation ── */}
            <div className="rec-section">
                <span className="rec-label-tag">💊 Clinical Recommendation</span>
                <p className="rec-text">{rec.recommendation}</p>
                {rec.contraindicated && <span className="contraindicated-badge">⛔ CONTRAINDICATED</span>}
            </div>

            {/* ── Expand toggle ── */}
            <button className="expand-btn" onClick={() => { setExpanded(!expanded); if (!expanded) setActiveTab(availableTabs[0]?.id || "quality"); }}>
                <span>{expanded ? "↑ Hide Full Analysis" : "↓ Show Full Analysis"}</span>
                <span className="expand-count">{availableTabs.length} sections</span>
            </button>

            {/* ── Expanded: Tabbed ── */}
            {expanded && (
                <div className="expanded-details">
                    <div className="tab-bar">
                        {availableTabs.map(t => (
                            <button
                                key={t.id}
                                className={`tab-btn${activeTab === t.id ? " active" : ""}`}
                                onClick={() => setActiveTab(t.id)}
                                style={activeTab === t.id ? { color: cfg.color, borderColor: cfg.border, background: cfg.bg } : {}}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>

                    <div className="tab-content">
                        {activeTab === "mechanism" && expl.mechanism && (
                            <div className="tab-pane">
                                <div className="detail-icon-row"><span className="detail-big-icon">🔬</span><div><p className="detail-heading">Biological Mechanism</p><p className="detail-sub">How this gene variant affects drug metabolism</p></div></div>
                                <p className="detail-body">{expl.mechanism}</p>
                            </div>
                        )}
                        {activeTab === "implications" && expl.clinical_implications && (
                            <div className="tab-pane">
                                <div className="detail-icon-row"><span className="detail-big-icon">🏥</span><div><p className="detail-heading">Clinical Implications</p><p className="detail-sub">What this means for patient care</p></div></div>
                                <p className="detail-body">{expl.clinical_implications}</p>
                            </div>
                        )}
                        {activeTab === "monitoring" && expl.monitoring && (
                            <div className="tab-pane">
                                <div className="detail-icon-row"><span className="detail-big-icon">📋</span><div><p className="detail-heading">Monitoring Parameters</p><p className="detail-sub">What to watch for during treatment</p></div></div>
                                <p className="detail-body">{expl.monitoring}</p>
                            </div>
                        )}
                        {activeTab === "cpic" && rec.cpic_recommendation && (
                            <div className="tab-pane">
                                <div className="detail-icon-row"><span className="detail-big-icon">📖</span><div><p className="detail-heading">CPIC Guideline</p><p className="detail-sub">Clinical Pharmacogenetics Implementation Consortium</p></div></div>
                                <p className="detail-body">{rec.cpic_recommendation}</p>
                            </div>
                        )}
                        {activeTab === "variants" && profile.detected_variants?.length > 0 && (
                            <div className="tab-pane">
                                <div className="detail-icon-row"><span className="detail-big-icon">🧬</span><div><p className="detail-heading">Detected Variants</p><p className="detail-sub">{profile.detected_variants.length} variant{profile.detected_variants.length !== 1 ? "s" : ""} found in VCF</p></div></div>
                                <div className="table-wrap">
                                    <table className="variants-table">
                                        <thead><tr><th>rsID</th><th>Gene</th><th>Star Allele</th><th>Position</th><th>Ref → Alt</th></tr></thead>
                                        <tbody>
                                            {profile.detected_variants.map((v, i) => (
                                                <tr key={i}>
                                                    <td className="mono chip">{v.rsid}</td>
                                                    <td><span className="gene-chip">{v.gene}</span></td>
                                                    <td className="mono">{v.star_allele}</td>
                                                    <td className="mono dim">{v.chromosome}:{v.position}</td>
                                                    <td className="mono">{v.ref_allele} <span className="arrow">→</span> {v.alt_allele}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                        {activeTab === "quality" && (
                            <div className="tab-pane">
                                <div className="detail-icon-row"><span className="detail-big-icon">✅</span><div><p className="detail-heading">Quality Metrics</p><p className="detail-sub">Analysis pipeline quality indicators</p></div></div>
                                <div className="qm-grid">
                                    {[
                                        { label: "VCF Parsed", value: qm.vcf_parsing_success ? "✓ Yes" : "✕ No", color: qm.vcf_parsing_success ? "#00e87a" : "#ff4d6a", icon: "📄" },
                                        { label: "Variants Found", value: qm.total_variants_parsed ?? "—", color: "var(--text)", icon: "🔢" },
                                        { label: "Gene Found", value: qm.primary_gene_found ? "✓ Yes" : "— No", color: qm.primary_gene_found ? "#00e87a" : "#ffc940", icon: "🧬" },
                                        { label: "Explanation By", value: qm.explanation_source ?? "—", color: "var(--text)", icon: "🤖" },
                                    ].map(({ label, value, color, icon }) => (
                                        <div className="qm-item" key={label}>
                                            <span className="qm-icon">{icon}</span>
                                            <span className="qm-label">{label}</span>
                                            <span className="qm-value" style={{ color }}>{value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="actions-row">
                        <button className="action-btn download" onClick={downloadJSON}><span>↓</span> Download Report</button>
                        <button className="action-btn copy" onClick={copyJSON}><span>{copied ? "✓" : "⧉"}</span> {copied ? "Copied!" : "Copy JSON"}</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function ResultsDisplay({ results, onReset }) {
    const riskCounts = results.reduce((acc, r) => {
        const label = r.risk_assessment?.risk_label || "Unknown";
        acc[label] = (acc[label] || 0) + 1;
        return acc;
    }, {});

    return (
        <div className="results-wrap">
            <div className="results-header">
                <div className="results-title-block">
                    <h2 className="results-title">Analysis <span>Complete</span></h2>
                    <p className="results-sub">{results.length} drug{results.length !== 1 ? "s" : ""} analyzed · {results[0]?.patient_id}</p>
                </div>
                <button className="reset-btn" onClick={onReset}>← New Analysis</button>
            </div>

            <div className="summary-pills">
                {Object.entries(riskCounts).map(([label, count]) => {
                    const cfg = RISK_CONFIG[label] || RISK_CONFIG["Unknown"];
                    return (
                        <span key={label} className="summary-pill" style={{ color: cfg.color, background: cfg.label_bg, border: `1px solid ${cfg.border}` }}>
                            {cfg.icon} {count}× {label}
                        </span>
                    );
                })}
            </div>

            <div className="results-list">
                {results.map((r, i) => <ResultCard key={i} result={r} />)}
            </div>
        </div>
    );
}