// src/lib/services/mangadex.ts
import type { SearchResult, MediaType } from "@/types/media";

const BASE_URL = "https://api.mangadex.org";

export async function searchMangaDex(
  query: string,
  mediaType: "MANGA" | "MANHWA" = "MANGA"
): Promise<SearchResult[]> {
  const originalLanguage =
    mediaType === "MANHWA" ? ["ko"] : ["ja"];

  const params = new URLSearchParams();
  params.set("title", query);
  params.set("limit", "10");
  params.append("contentRating[]", "safe");
  params.append("contentRating[]", "suggestive");
  params.append("includes[]", "cover_art");
  params.append("includes[]", "author");
  originalLanguage.forEach((lang) =>
    params.append("originalLanguage[]", lang)
  );

  const res = await fetch(`${BASE_URL}/manga?${params.toString()}`);
  if (!res.ok) throw new Error(`MangaDex error: ${res.status}`);
  const { data } = await res.json();

  return data.map((item: MangaDexItem) => normalizeManga(item, mediaType));
}

export async function getMangaDexDetails(
  id: string,
  mediaType: "MANGA" | "MANHWA" = "MANGA"
): Promise<SearchResult> {
  const res = await fetch(
    `${BASE_URL}/manga/${id}?includes[]=cover_art&includes[]=author`
  );
  if (!res.ok) throw new Error(`MangaDex detail error: ${res.status}`);
  const { data } = await res.json();
  return normalizeManga(data, mediaType);
}

// ─── Normalización ────────────────────────────────────────────────────────────

interface MangaDexItem {
  id: string;
  attributes: {
    title: Record<string, string>;
    description: Record<string, string>;
    lastChapter: string | null;
    lastVolume: string | null;
    year: number | null;
    tags: { attributes: { name: Record<string, string> } }[];
  };
  relationships: {
    type: string;
    attributes?: { fileName?: string; name?: string };
    id: string;
  }[];
}

function normalizeManga(
  item: MangaDexItem,
  mediaType: "MANGA" | "MANHWA"
): SearchResult {
  const { attributes, relationships } = item;

  const title =
    attributes.title["en"] ??
    attributes.title["ja-ro"] ??
    Object.values(attributes.title)[0] ??
    "Sin título";

  const synopsis =
    attributes.description["en"] ??
    attributes.description["es"] ??
    Object.values(attributes.description)[0] ??
    "";

  // Portada
  const coverRel = relationships.find((r) => r.type === "cover_art");
  const coverUrl = coverRel?.attributes?.fileName
    ? `https://uploads.mangadex.org/covers/${item.id}/${coverRel.attributes.fileName}.256.jpg`
    : "/placeholder-cover.png";

  // Autor
  const authorRel = relationships.find((r) => r.type === "author");
  const author = authorRel?.attributes?.name ?? "";

  // Géneros
  const genres = attributes.tags.map(
    (t) => t.attributes.name["en"] ?? Object.values(t.attributes.name)[0]
  );

  const totalChapters = attributes.lastChapter
    ? parseInt(attributes.lastChapter)
    : null;
  const volumes = attributes.lastVolume
    ? parseInt(attributes.lastVolume)
    : 0;

  return {
    externalId: item.id,
    source: "mangadex",
    mediaType,
    title,
    synopsis: synopsis.slice(0, 500),
    coverUrl,
    year: attributes.year ?? undefined,
    genres,
    suggestedFields: {
      chaptersRead: 0,
      totalChapters,
      volumes,
      author,
    },
  };
}