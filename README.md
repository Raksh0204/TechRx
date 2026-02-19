# ⬡ PharmaGuard — Pharmacogenomic Risk Prediction System

> AI-powered web application that analyzes patient genetic data (VCF files) and predicts personalized drug risks with LLM-generated clinical explanations.

**RIFT 2026 Hackathon · HealthTech / Pharmacogenomics Track**

---

## 🌐 Live Demo

🔗 **[Live Application URL]** — _Add your deployed URL here_

📹 **[LinkedIn Demo Video]** — _Add your LinkedIn video URL here_

---

## 🧬 What It Does

PharmaGuard accepts a patient VCF (Variant Call Format) file and drug name(s), then:

1. Parses the VCF file to extract pharmacogenomic variants across 6 critical genes
2. Maps detected star alleles to diplotypes and phenotypes using CPIC guidelines
3. Predicts drug-specific risk: **Safe / Adjust Dosage / Toxic / Ineffective / Unknown**
4. Generates clinical explanations using LLM (GPT-4) or a rule-based fallback
5. Returns a structured JSON report with CPIC-aligned recommendations

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────┐
│                    React Frontend                    │
│  FileUpload → DrugInput → Analyze → ResultsDisplay  │
└─────────────────────┬───────────────────────────────┘
                      │ HTTP POST /analyze (multipart)
┌─────────────────────▼───────────────────────────────┐
│                   FastAPI Backend                    │
│                                                      │
│  ┌──────────────┐  ┌─────────────┐  ┌────────────┐  │
│  │  VCF Parser  │→ │ Risk Engine │→ │LLM Explainer│  │
│  │  (vcf_parser)│  │(risk_engine)│  │(llm_explainer)│ │
│  └──────────────┘  └─────────────┘  └────────────┘  │
│                                                      │
│  Gene → Diplotype → Phenotype → Risk Label → JSON   │
└─────────────────────────────────────────────────────┘
```

**Data Flow:**
```
VCF File → Parse variants → Extract star alleles → Lookup diplotype
→ Lookup phenotype (CPIC) → Lookup drug risk → Generate explanation
→ Return structured JSON
```

---

## 🧰 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, CSS Variables |
| Backend | FastAPI, Python 3.10+ |
| VCF Parsing | Custom Python parser (VCF v4.2) |
| Risk Engine | CPIC guideline lookup tables |
| LLM | OpenAI GPT-4 (with rule-based fallback) |
| Deployment | Vercel (frontend) + Render (backend) |

---

## 🧬 Supported Genes & Drugs

| Gene | Drug | Key Risk |
|------|------|----------|
| CYP2D6 | CODEINE | Poor metabolizer = Toxic (respiratory depression) |
| CYP2C19 | CLOPIDOGREL | Poor metabolizer = Ineffective (no drug activation) |
| CYP2C9 | WARFARIN | Poor metabolizer = Toxic (bleeding risk) |
| SLCO1B1 | SIMVASTATIN | *5 variant = Toxic (myopathy risk) |
| TPMT | AZATHIOPRINE | Poor metabolizer = Toxic (myelosuppression) |
| DPYD | FLUOROURACIL | Poor metabolizer = Toxic (fatal chemotoxicity) |

**Risk Labels:** `Safe` · `Adjust Dosage` · `Toxic` · `Ineffective` · `Unknown`

**Phenotypes:** `Poor Metabolizer (PM)` · `Intermediate Metabolizer (IM)` · `Normal Metabolizer (NM)` · `Rapid Metabolizer (RM)` · `Ultrarapid Metabolizer (URM)`

---

## 🚀 Installation & Setup

### Prerequisites
- Python 3.10+
- Node.js 18+
- npm or yarn

### Backend Setup

```bash
cd backend
pip install -r requirements.txt

# Optional: set OpenAI key for richer explanations
export OPENAI_API_KEY=sk-your-key-here

# Run server
uvicorn main:app --reload --port 8000
```

### Frontend Setup

```bash
cd frontend
npm install

# Copy environment file
cp .env.example .env
# Edit .env and set VITE_API_URL to your backend URL

npm run dev
```

Frontend runs at `http://localhost:5173`

---

## 📡 API Documentation

### `POST /analyze`

Analyze a patient VCF file for pharmacogenomic risks.

**Request** (multipart/form-data):
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `vcf_file` | File (.vcf) | ✓ | Patient VCF file |
| `drugs` | String | ✓ | Comma-separated drug names |
| `patient_id` | String | — | Optional patient identifier |
| `openai_api_key` | String | — | Optional OpenAI key for GPT-4 explanations |

**Response** (JSON):
```json
{
  "patient_id": "PATIENT_001",
  "drug": "CODEINE",
  "timestamp": "2026-02-19T10:00:00Z",
  "risk_assessment": {
    "risk_label": "Toxic",
    "confidence_score": 0.95,
    "severity": "critical"
  },
  "pharmacogenomic_profile": {
    "primary_gene": "CYP2D6",
    "diplotype": "*1/*1xN",
    "phenotype": "Ultrarapid Metabolizer",
    "detected_variants": [...]
  },
  "clinical_recommendation": {
    "recommendation": "Avoid codeine...",
    "cpic_recommendation": "...",
    "requires_dose_adjustment": true,
    "contraindicated": true
  },
  "llm_generated_explanation": {
    "summary": "...",
    "mechanism": "...",
    "clinical_implications": "...",
    "monitoring": "..."
  },
  "quality_metrics": {
    "vcf_parsing_success": true,
    "total_variants_parsed": 6,
    "genes_detected": ["CYP2D6", "CYP2C19"]
  }
}
```

### `POST /analyze/sample`

Run analysis using the built-in sample VCF (for demo/testing).

### `GET /drugs`

Returns list of supported drug names.

---

## 📋 Usage Examples

### 1. Basic Analysis (curl)
```bash
curl -X POST http://localhost:8000/analyze \
  -F "vcf_file=@patient.vcf" \
  -F "drugs=CODEINE,WARFARIN" \
  -F "patient_id=PATIENT_001"
```

### 2. Sample VCF Demo
```bash
curl -X POST http://localhost:8000/analyze/sample \
  -F "drugs=FLUOROURACIL"
```

### 3. VCF File Format
```
##fileformat=VCFv4.2
##INFO=<ID=GENE,Number=1,Type=String,Description="Gene symbol">
##INFO=<ID=STAR,Number=1,Type=String,Description="Star allele">
##INFO=<ID=RS,Number=1,Type=String,Description="dbSNP rsID">
#CHROM  POS       ID  REF  ALT  QUAL  FILTER  INFO
chr22   42522613  .   C    T    .     PASS    GENE=CYP2D6;STAR=*4;RS=rs3892097
```

---

## ☁️ Deployment

### Backend → Render
1. Push to GitHub
2. Create new Web Service on render.com
3. Set root directory to `backend/`
4. Build command: `pip install -r requirements.txt`
5. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
6. Add env var: `OPENAI_API_KEY`

### Frontend → Vercel
1. Import GitHub repo on vercel.com
2. Set root directory to `frontend/`
3. Add env var: `VITE_API_URL=https://your-render-url.onrender.com`
4. Deploy

---

## ⚠️ Known Limitations

- VCF files must include `GENE`, `STAR`, and `RS` tags in the INFO field
- Currently supports 6 genes and 6 drugs (CPIC-prioritized list)
- Diplotype inference is based on star alleles in VCF; complex structural variants not fully supported
- LLM explanations require an OpenAI API key; falls back to rule-based explanations otherwise
- Not validated for clinical use — for research and demonstration purposes only

---

## 👥 Team Members

- _Add team member names here_

---

## 📚 References

- [CPIC Guidelines](https://cpicpgx.org)
- [PharmGKB](https://pharmgkb.org)
- [VCF Format Specification](https://samtools.github.io/hts-specs/VCFv4.2.pdf)

---

> ⚕️ **Disclaimer:** PharmaGuard is a research and demonstration tool. It is not a substitute for professional medical judgment or validated clinical decision support systems.
