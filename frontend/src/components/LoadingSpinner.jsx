import "./LoadingSpinner.css";
export default function LoadingSpinner() {
    return (
        <div className="spinner-overlay">
            <div className="spinner-box">
                <div className="dna-spinner">{[...Array(8)].map((_, i) => <div key={i} className="dna-dot" style={{ animationDelay: `${i * 0.1}s` }} />)}</div>
                <p className="spinner-text">Analyzing pharmacogenomic profile...</p>
                <p className="spinner-sub">Parsing VCF · Mapping diplotypes · Assessing risk</p>
            </div>
        </div>
    );
}