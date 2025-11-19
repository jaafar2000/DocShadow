declare module "pdf-parse-fixed" {
  interface PDFParseResult {
    text: string;
  }

  function pdf(buffer: Buffer): Promise<PDFParseResult>;

  export default pdf;
}
