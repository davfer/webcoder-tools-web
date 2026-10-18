import * as yaml from 'js-yaml';

export interface DecodedSecretEntry {
  key: string;
  base64Value: string;
  decodedValue: string;
}

export interface K8sResourceSummary {
  apiVersion: string;
  kind: string;
  name: string;
  namespace?: string;
  labels?: Record<string, string>;
  isSecret: boolean;
  secretEntries?: DecodedSecretEntry[];
  summary: string;
}

export interface K8sAnalysis {
  isK8s: boolean;
  resources: K8sResourceSummary[];
  rawYaml: string;
  error?: string;
}

export function analyzeK8s(input: string): K8sAnalysis {
  const trimmed = input.trim();
  if (!trimmed) {
    return { isK8s: false, resources: [], rawYaml: '' };
  }

  // Quick check for apiVersion and kind
  const hasK8sIndicators = /(apiVersion:\s*[a-zA-Z0-9./-]+|kind:\s*[a-zA-Z0-9]+|"apiVersion"\s*:|"kind"\s*:)/.test(
    trimmed
  );

  if (!hasK8sIndicators) {
    return { isK8s: false, resources: [], rawYaml: trimmed };
  }

  try {
    const docs: any[] = [];
    yaml.loadAll(trimmed, (doc) => {
      if (doc && typeof doc === 'object') {
        docs.push(doc);
      }
    });

    if (docs.length === 0) {
      return { isK8s: false, resources: [], rawYaml: trimmed };
    }

    const resources: K8sResourceSummary[] = [];

    for (const doc of docs) {
      if (!doc.kind) continue;

      const isSecret = doc.kind === 'Secret';
      const secretEntries: DecodedSecretEntry[] = [];

      if (isSecret && doc.data && typeof doc.data === 'object') {
        for (const [k, val] of Object.entries(doc.data)) {
          if (typeof val === 'string') {
            try {
              const decoded = atob(val.trim());
              secretEntries.push({
                key: k,
                base64Value: val,
                decodedValue: decoded,
              });
            } catch {
              secretEntries.push({
                key: k,
                base64Value: val,
                decodedValue: '[Failed to base64 decode]',
              });
            }
          }
        }
      }

      resources.push({
        apiVersion: doc.apiVersion || 'v1',
        kind: doc.kind,
        name: doc.metadata?.name || 'unnamed-resource',
        namespace: doc.metadata?.namespace,
        labels: doc.metadata?.labels,
        isSecret,
        secretEntries: secretEntries.length > 0 ? secretEntries : undefined,
        summary: `${doc.kind} "${doc.metadata?.name || 'unnamed'}" in ${doc.metadata?.namespace || 'default'}`,
      });
    }

    return {
      isK8s: resources.length > 0,
      resources,
      rawYaml: trimmed,
    };
  } catch (err: any) {
    return {
      isK8s: false,
      resources: [],
      rawYaml: trimmed,
      error: err?.message,
    };
  }
}
