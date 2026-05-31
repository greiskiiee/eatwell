export async function translateToMongolian(text: string): Promise<string> {
  const trimmed = text.trim();
  if (!trimmed) return text;

  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=mn&dt=t&q=${encodeURIComponent(trimmed)}`;
  const res = await fetch(url);
  const data = await res.json();
  return data[0].map((item: unknown[]) => item[0]).join("");
}
