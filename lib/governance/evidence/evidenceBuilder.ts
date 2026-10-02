export class EvidenceBuilder {
  public static buildEvidence(base: Record<string, any>): Record<string, any> {
    return {
      ...base,
      generatedAt: new Date().toISOString(),
      sourceAudited: true
    };
  }
}
