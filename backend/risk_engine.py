"""
Risk Engine for PharmaGuard
Gene-drug risk lookup tables based on CPIC guidelines
Maps diplotype -> phenotype -> risk label for each drug
"""

from typing import Dict, Optional, Tuple

# ─────────────────────────────────────────────
# DIPLOTYPE → PHENOTYPE MAPPINGS (per gene)
# Source: CPIC / PharmGKB guidelines
# ─────────────────────────────────────────────

DIPLOTYPE_TO_PHENOTYPE = {
    "CYP2D6": {
        "*1/*1": "Normal Metabolizer",
        "*1/*2": "Normal Metabolizer",
        "*2/*2": "Normal Metabolizer",
        "*1/*4": "Intermediate Metabolizer",
        "*1/*5": "Intermediate Metabolizer",
        "*1/*41": "Intermediate Metabolizer",
        "*4/*4": "Poor Metabolizer",
        "*4/*5": "Poor Metabolizer",
        "*5/*5": "Poor Metabolizer",
        "*4/*41": "Poor Metabolizer",
        "*1/*1xN": "Ultrarapid Metabolizer",
        "*2/*2xN": "Ultrarapid Metabolizer",
        "default": "Normal Metabolizer"
    },
    "CYP2C19": {
        "*1/*1": "Normal Metabolizer",
        "*1/*2": "Intermediate Metabolizer",
        "*1/*3": "Intermediate Metabolizer",
        "*2/*2": "Poor Metabolizer",
        "*2/*3": "Poor Metabolizer",
        "*3/*3": "Poor Metabolizer",
        "*1/*17": "Rapid Metabolizer",
        "*17/*17": "Ultrarapid Metabolizer",
        "*2/*17": "Intermediate Metabolizer",
        "default": "Normal Metabolizer"
    },
    "CYP2C9": {
        "*1/*1": "Normal Metabolizer",
        "*1/*2": "Intermediate Metabolizer",
        "*1/*3": "Intermediate Metabolizer",
        "*2/*2": "Intermediate Metabolizer",
        "*2/*3": "Poor Metabolizer",
        "*3/*3": "Poor Metabolizer",
        "default": "Normal Metabolizer"
    },
    "SLCO1B1": {
        "*1/*1": "Normal Function",
        "*1/*5": "Decreased Function",
        "*5/*5": "Poor Function",
        "*1/*15": "Decreased Function",
        "*15/*15": "Poor Function",
        "*1/*1a": "Normal Function",
        "default": "Normal Function"
    },
    "TPMT": {
        "*1/*1": "Normal Metabolizer",
        "*1/*2": "Intermediate Metabolizer",
        "*1/*3A": "Intermediate Metabolizer",
        "*1/*3C": "Intermediate Metabolizer",
        "*2/*3A": "Poor Metabolizer",
        "*3A/*3A": "Poor Metabolizer",
        "*3A/*3C": "Poor Metabolizer",
        "*3C/*3C": "Poor Metabolizer",
        "default": "Normal Metabolizer"
    },
    "DPYD": {
        "*1/*1": "Normal Metabolizer",
        "*1/*2A": "Intermediate Metabolizer",
        "*2A/*2A": "Poor Metabolizer",
        "*1/*13": "Intermediate Metabolizer",
        "*13/*13": "Poor Metabolizer",
        "default": "Normal Metabolizer"
    }
}


# ─────────────────────────────────────────────
# PHENOTYPE + DRUG → RISK ASSESSMENT
# Source: CPIC guidelines
# ─────────────────────────────────────────────

DRUG_RISK_TABLE = {
    "CODEINE": {
        "primary_gene": "CYP2D6",
        "risks": {
            "Ultrarapid Metabolizer": {
                "risk_label": "Toxic",
                "severity": "critical",
                "confidence_score": 0.95,
                "recommendation": "Avoid codeine. Use alternative non-opioid analgesic. Risk of life-threatening respiratory depression.",
                "cpic_recommendation": "Avoid codeine use. Alternative opioids such as morphine or non-opioid analgesics are recommended."
            },
            "Normal Metabolizer": {
                "risk_label": "Safe",
                "severity": "none",
                "confidence_score": 0.90,
                "recommendation": "Standard dose codeine is appropriate.",
                "cpic_recommendation": "Label recommended age- or weight-specific dosing."
            },
            "Intermediate Metabolizer": {
                "risk_label": "Adjust Dosage",
                "severity": "moderate",
                "confidence_score": 0.80,
                "recommendation": "Use with caution. Consider lower dose or alternative analgesic.",
                "cpic_recommendation": "Use label recommended age- or weight-specific dosing. If no response, consider alternative analgesic."
            },
            "Poor Metabolizer": {
                "risk_label": "Ineffective",
                "severity": "moderate",
                "confidence_score": 0.92,
                "recommendation": "Codeine will not work effectively. Use alternative analgesic like morphine or tramadol.",
                "cpic_recommendation": "Avoid codeine use. Alternative non-opioid analgesics are recommended."
            },
            "Rapid Metabolizer": {
                "risk_label": "Adjust Dosage",
                "severity": "low",
                "confidence_score": 0.75,
                "recommendation": "Monitor for increased opioid effects. Consider lower dose.",
                "cpic_recommendation": "Use label recommended dosing with caution."
            }
        }
    },
    "WARFARIN": {
        "primary_gene": "CYP2C9",
        "secondary_gene": "CYP2C19",
        "risks": {
            "Normal Metabolizer": {
                "risk_label": "Safe",
                "severity": "none",
                "confidence_score": 0.88,
                "recommendation": "Standard warfarin dosing. Regular INR monitoring recommended.",
                "cpic_recommendation": "Initiate therapy with standard recommended doses."
            },
            "Intermediate Metabolizer": {
                "risk_label": "Adjust Dosage",
                "severity": "moderate",
                "confidence_score": 0.85,
                "recommendation": "Reduce warfarin dose by 25-50%. Increased bleeding risk. Close INR monitoring required.",
                "cpic_recommendation": "Consider 25-50% reduction in initiation dose. Titrate dose based on INR."
            },
            "Poor Metabolizer": {
                "risk_label": "Toxic",
                "severity": "high",
                "confidence_score": 0.93,
                "recommendation": "Significantly reduce warfarin dose (50-75% reduction). Very high bleeding risk. Frequent INR monitoring essential.",
                "cpic_recommendation": "Consider 50-75% reduction in initiation dose. More frequent INR monitoring."
            }
        }
    },
    "CLOPIDOGREL": {
        "primary_gene": "CYP2C19",
        "risks": {
            "Normal Metabolizer": {
                "risk_label": "Safe",
                "severity": "none",
                "confidence_score": 0.90,
                "recommendation": "Standard clopidogrel dosing is appropriate.",
                "cpic_recommendation": "Label recommended dosing."
            },
            "Rapid Metabolizer": {
                "risk_label": "Safe",
                "severity": "none",
                "confidence_score": 0.88,
                "recommendation": "Standard dosing. May have slightly enhanced antiplatelet effect.",
                "cpic_recommendation": "Label recommended dosing."
            },
            "Ultrarapid Metabolizer": {
                "risk_label": "Safe",
                "severity": "none",
                "confidence_score": 0.85,
                "recommendation": "Standard dosing with monitoring for excessive bleeding.",
                "cpic_recommendation": "Label recommended dosing."
            },
            "Intermediate Metabolizer": {
                "risk_label": "Ineffective",
                "severity": "high",
                "confidence_score": 0.87,
                "recommendation": "Clopidogrel may not work effectively. Consider alternative antiplatelet therapy (prasugrel or ticagrelor).",
                "cpic_recommendation": "Alternative antiplatelet therapy recommended if clinically feasible."
            },
            "Poor Metabolizer": {
                "risk_label": "Ineffective",
                "severity": "critical",
                "confidence_score": 0.95,
                "recommendation": "Clopidogrel will not work. Use alternative antiplatelet agent (prasugrel or ticagrelor).",
                "cpic_recommendation": "Avoid clopidogrel. Use prasugrel or ticagrelor if no contraindications."
            }
        }
    },
    "SIMVASTATIN": {
        "primary_gene": "SLCO1B1",
        "risks": {
            "Normal Function": {
                "risk_label": "Safe",
                "severity": "none",
                "confidence_score": 0.89,
                "recommendation": "Standard simvastatin dosing is appropriate.",
                "cpic_recommendation": "Prescribe desired starting dose and adjust doses based on disease-specific guidelines."
            },
            "Decreased Function": {
                "risk_label": "Adjust Dosage",
                "severity": "moderate",
                "confidence_score": 0.84,
                "recommendation": "Increased risk of statin-induced myopathy. Limit simvastatin dose to 20mg/day or consider alternative statin.",
                "cpic_recommendation": "Prescribe a lower dose or consider an alternative statin. Routine CK monitoring recommended."
            },
            "Poor Function": {
                "risk_label": "Toxic",
                "severity": "high",
                "confidence_score": 0.91,
                "recommendation": "High risk of severe myopathy/rhabdomyolysis. Use alternative statin (pravastatin or rosuvastatin).",
                "cpic_recommendation": "Avoid simvastatin. Consider alternative statin therapy with lower myopathy risk."
            }
        }
    },
    "AZATHIOPRINE": {
        "primary_gene": "TPMT",
        "risks": {
            "Normal Metabolizer": {
                "risk_label": "Safe",
                "severity": "none",
                "confidence_score": 0.91,
                "recommendation": "Standard azathioprine dosing is appropriate.",
                "cpic_recommendation": "Start with normal starting dose."
            },
            "Intermediate Metabolizer": {
                "risk_label": "Adjust Dosage",
                "severity": "moderate",
                "confidence_score": 0.88,
                "recommendation": "Reduce azathioprine dose by 30-70%. Increased risk of myelosuppression.",
                "cpic_recommendation": "Start at 30-70% of full dose. Allow 2-4 weeks to reach steady state."
            },
            "Poor Metabolizer": {
                "risk_label": "Toxic",
                "severity": "critical",
                "confidence_score": 0.96,
                "recommendation": "Azathioprine is contraindicated. Very high risk of life-threatening myelosuppression. Use alternative immunosuppressant.",
                "cpic_recommendation": "Avoid azathioprine. Consider non-thiopurine immunosuppressant therapy."
            }
        }
    },
    "FLUOROURACIL": {
        "primary_gene": "DPYD",
        "risks": {
            "Normal Metabolizer": {
                "risk_label": "Safe",
                "severity": "none",
                "confidence_score": 0.89,
                "recommendation": "Standard fluorouracil dosing is appropriate.",
                "cpic_recommendation": "Use label recommended dosing."
            },
            "Intermediate Metabolizer": {
                "risk_label": "Adjust Dosage",
                "severity": "high",
                "confidence_score": 0.90,
                "recommendation": "Reduce starting dose by 50%. High risk of severe, potentially fatal toxicity at standard doses.",
                "cpic_recommendation": "Start with 50% reduction of normal starting dose. Increase dose in subsequent cycles if tolerated."
            },
            "Poor Metabolizer": {
                "risk_label": "Toxic",
                "severity": "critical",
                "confidence_score": 0.97,
                "recommendation": "Fluorouracil is contraindicated. Extremely high risk of fatal toxicity. Use alternative chemotherapy.",
                "cpic_recommendation": "Avoid fluorouracil. Select alternative drug not metabolized by DPYD."
            }
        }
    }
}


def get_phenotype(gene: str, diplotype: str) -> str:
    """Look up phenotype from gene + diplotype."""
    gene_table = DIPLOTYPE_TO_PHENOTYPE.get(gene, {})
    # Try direct match
    if diplotype in gene_table:
        return gene_table[diplotype]
    # Try reversed diplotype (e.g., *2/*1 -> *1/*2)
    parts = diplotype.split("/")
    if len(parts) == 2:
        reversed_diplotype = f"{parts[1]}/{parts[0]}"
        if reversed_diplotype in gene_table:
            return gene_table[reversed_diplotype]
    # Return default
    return gene_table.get("default", "Unknown")


def assess_risk(drug: str, diplotypes: Dict[str, str]) -> Dict:
    """
    Given a drug name and diplotypes dict, return full risk assessment.
    """
    drug_upper = drug.upper().strip()

    if drug_upper not in DRUG_RISK_TABLE:
        return {
            "risk_label": "Unknown",
            "severity": "none",
            "confidence_score": 0.0,
            "recommendation": f"Drug '{drug}' is not in our pharmacogenomic database.",
            "cpic_recommendation": "Consult clinical pharmacist.",
            "primary_gene": "Unknown",
            "phenotype": "Unknown",
            "diplotype": "Unknown",
            "detected_variants": []
        }

    drug_info = DRUG_RISK_TABLE[drug_upper]
    primary_gene = drug_info["primary_gene"]

    # Get diplotype and phenotype for primary gene
    diplotype = diplotypes.get(primary_gene, "*1/*1")
    phenotype = get_phenotype(primary_gene, diplotype)

    # Get risk for this phenotype
    risk_data = drug_info["risks"].get(phenotype, {
        "risk_label": "Unknown",
        "severity": "none",
        "confidence_score": 0.5,
        "recommendation": "Insufficient pharmacogenomic data for this combination.",
        "cpic_recommendation": "Consult clinical pharmacist for guidance."
    })

    return {
        "risk_label": risk_data["risk_label"],
        "severity": risk_data["severity"],
        "confidence_score": risk_data["confidence_score"],
        "recommendation": risk_data["recommendation"],
        "cpic_recommendation": risk_data["cpic_recommendation"],
        "primary_gene": primary_gene,
        "phenotype": phenotype,
        "diplotype": diplotype
    }


def get_supported_drugs():
    return list(DRUG_RISK_TABLE.keys())