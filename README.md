# Ungarinyin

## `analyze_texts.py`

This file actually just sends the documents stored in `Typescripts`in the given S3 bucket to AWS Textract. Textract is configured to send an SNS notification when the text extraction is completed.

## `OCRProcessed`

AWS Lambda function triggered by the SNS notification produced by Textract. It stores the resuls in the `OCR` folder of the S3 bucket.

## `ocr_results_corrector`

SPA App made with Svelte to correct and verify the results given by AWS Textract.
