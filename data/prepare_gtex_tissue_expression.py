import argparse
import re

import hail as hl


def format_tissue_name(tissue_name):
    return re.sub(r"[-\(\)_ ]+", "_", tissue_name).rstrip("_").lower()


def prepare_gtex_expression_data(transcript_tpms_path, sample_annotations_path):
    # Import data
    ds = hl.import_matrix_table(
        transcript_tpms_path, row_fields={"transcript_id": hl.tstr, "gene_id": hl.tstr}, entry_type=hl.tfloat
    )
    ds = ds.rename({"col_id": "sample_id"})
    ds = ds.repartition(100, shuffle=True)

    samples = hl.import_table(sample_annotations_path, key="SAMPID")

    # Separate version numbers from transcript and gene IDs
    ds = ds.annotate_rows(
        transcript_id=ds.transcript_id.split(r"\.")[0],
        transcript_version=hl.int(ds.transcript_id.split(r"\.")[1]),
        gene_id=ds.gene_id.split(r"\.")[0],
        gene_version=hl.int(ds.gene_id.split(r"\.")[1]),
    )

    # Annotate columns with the tissue the sample came from
    ds = ds.annotate_cols(tissue=samples[ds.sample_id].SMTSD)

    # Collect expression into median across all samples in each tissue
    ds = ds.group_cols_by(ds.tissue).aggregate(**{"": hl.agg.approx_median(ds.x)}).make_table()

    # Format tissue names
    other_fields = {"transcript_id", "transcript_version", "gene_id", "gene_version"}
    tissues = [f for f in ds.row_value.dtype.fields if f not in other_fields]
    ds = ds.transmute(tissues=hl.struct(**{format_tissue_name(tissue): ds[tissue] for tissue in tissues}))

    ds = ds.key_by("transcript_id").drop("row_id")

    return ds


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("transcript_tpms")
    parser.add_argument("sample_annotations")
    parser.add_argument("--output", required=True)
    args = parser.parse_args()

    ds = prepare_gtex_expression_data(args.transcript_tpms, args.sample_annotations)

    ds.write(args.output)


if __name__ == "__main__":
    main()
