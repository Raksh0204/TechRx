import "./DrugInput.css";
const SUPPORTED = ["CODEINE", "WARFARIN", "CLOPIDOGREL", "SIMVASTATIN", "AZATHIOPRINE", "FLUOROURACIL"];
export default function DrugInput({ value, onChange }) {
    const addDrug = (drug) => {
        const current = value.split(",").map(d => d.trim().toUpperCase()).filter(Boolean);
        if (!current.includes(drug)) onChange(current.length ? `${value}, ${drug}` : drug);
    };
    return (
        <div className="drug-input-wrap">
            <label className="field-label">Drug Name(s) <span className="required">*</span></label>
            <input className="field-input" placeholder="e.g. CODEINE, WARFARIN" value={value} onChange={(e) => onChange(e.target.value)} />
            <div className="quick-add">
                <span className="quick-label">Quick add:</span>
                {SUPPORTED.map(d => <button key={d} className="quick-btn" type="button" onClick={() => addDrug(d)}>{d}</button>)}
            </div>
        </div>
    );
}