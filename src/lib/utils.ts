export type Lang = "en" | "kn" | "hi";

export function getLang(searchParams: URLSearchParams): Lang {
  const lang = searchParams.get("lang");
  if (lang === "kn" || lang === "hi") return lang;
  return "en";
}

export function localizedField<T extends Record<string, unknown>>(
  row: T,
  field: string,
  lang: Lang
): unknown {
  const val = row[`${field}_${lang}`];
  // Fall back to English when the localized column is missing OR empty
  // (translations are stored as "" / "[]" rather than NULL for untranslated rows).
  if (val !== null && val !== undefined && val !== "" && val !== "[]") {
    return val;
  }
  return row[`${field}_en`];
}

export function serviceHeaders(name: string, version: string) {
  return {
    "X-Service-Name": name,
    "X-Service-Version": version,
  };
}

export function jsonResponse(
  data: unknown,
  status = 200,
  headers?: Record<string, string>
) {
  return Response.json(data, { status, headers });
}

export function errorResponse(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}
