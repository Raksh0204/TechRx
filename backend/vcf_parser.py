"""
VCF Parser for PharmaGuard
Parses VCF v4.2 files and extracts pharmacogenomic variants
"""

import re
from typing import Dict, List, Optional


# Target genes for pharmacogenomics analysis
TARGET_GENES = {"CYP2D6", "CYP2C19", "CYP2C9", "SLCO1B1", "TPMT", "DPYD"}


def parse_vcf(file_content: str) -> Dict:
    """
    Parse a VCF file and extract pharmacogenomic variants.
    Returns a dict with gene -> list of variants
    """
    variants = []
    metadata = {}
    gene_variants = {gene: [] for gene in TARGET_GENES}

    lines = file_content.strip().split("\n")

    for line in lines:
        line = line.strip()

        # Skip empty lines
        if not line:
            continue

        # Parse metadata lines
        if line.startswith("##"):
            if "=" in line:
                key_val = line[2:].split("=", 1)
                if len(key_val) == 2:
                    metadata[key_val[0]] = key_val[1]
            continue

        # Skip header line
        if line.startswith("#CHROM"):
            continue

        # Parse variant lines
        parts = line.split("\t")
        if len(parts) < 8:
            continue

        chrom, pos, vid, ref, alt, qual, filt, info = parts[:8]

        # Parse INFO field
        info_dict = parse_info_field(info)

        gene = info_dict.get("GENE", "")
        star_allele = info_dict.get("STAR", "")
        rsid = info_dict.get("RS", vid if vid != "." else "")

        if gene in TARGET_GENES:
            variant = {
                "rsid": rsid if rsid.startswith("rs") else f"rs{rsid}" if rsid.isdigit() else rsid,
                "chromosome": chrom,
                "position": pos,
                "ref_allele": ref,
                "alt_allele": alt,
                "gene": gene,
                "star_allele": star_allele,
                "filter_status": filt,
                "raw_info": info_dict
            }
            variants.append(variant)
            gene_variants[gene].append(variant)

    # Determine diplotypes per gene
    diplotypes = {}
    for gene, gene_vars in gene_variants.items():
        if gene_vars:
            diplotypes[gene] = infer_diplotype(gene, gene_vars)

    return {
        "variants": variants,
        "gene_variants": gene_variants,
        "diplotypes": diplotypes,
        "metadata": metadata,
        "vcf_parsing_success": len(variants) > 0,
        "total_variants_found": len(variants),
        "genes_detected": [g for g in TARGET_GENES if gene_variants[g]]
    }


def parse_info_field(info: str) -> Dict:
    """Parse the INFO field of a VCF line into a dictionary."""
    info_dict = {}
    for item in info.split(";"):
        if "=" in item:
            k, v = item.split("=", 1)
            info_dict[k.strip()] = v.strip()
        else:
            info_dict[item.strip()] = True
    return info_dict


def infer_diplotype(gene: str, variants: List[Dict]) -> str:
    """
    Infer diplotype from list of variants for a gene.
    Returns string like '*1/*2'
    """
    star_alleles = [v.get("star_allele", "") for v in variants if v.get("star_allele")]

    if not star_alleles:
        return "*1/*1"  # Default to normal if no star alleles found

    # Deduplicate and sort
    unique_alleles = list(set(star_alleles))

    if len(unique_alleles) == 1:
        return f"{unique_alleles[0]}/{unique_alleles[0]}"
    elif len(unique_alleles) >= 2:
        return f"{unique_alleles[0]}/{unique_alleles[1]}"
    else:
        return "*1/*1"


def get_sample_vcf() -> str:
    """Returns a sample VCF for testing purposes."""
    return """##fileformat=VCFv4.2
##FILTER=<ID=PASS,Description="All filters passed">
##INFO=<ID=GENE,Number=1,Type=String,Description="Gene symbol">
##INFO=<ID=STAR,Number=1,Type=String,Description="Star allele">
##INFO=<ID=RS,Number=1,Type=String,Description="dbSNP rsID">
#CHROM	POS	ID	REF	ALT	QUAL	FILTER	INFO
chr22	42522613	rs3892097	C	T	.	PASS	GENE=CYP2D6;STAR=*4;RS=rs3892097
chr10	96541616	rs4244285	G	A	.	PASS	GENE=CYP2C19;STAR=*2;RS=rs4244285
chr10	96702047	rs1799853	C	T	.	PASS	GENE=CYP2C9;STAR=*2;RS=rs1799853
chr12	21331549	rs4149056	T	C	.	PASS	GENE=SLCO1B1;STAR=*5;RS=rs4149056
chr6	18128556	rs1800462	G	A	.	PASS	GENE=TPMT;STAR=*2;RS=rs1800462
chr1	97981395	rs3918290	C	T	.	PASS	GENE=DPYD;STAR=*2A;RS=rs3918290
"""