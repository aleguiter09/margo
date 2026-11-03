import type { ResolvedEntity } from "../types/types";

type NamedEntity = {
  id: number;
  name: string;
};

export function resolveEntityByName(
  entities: NamedEntity[],
  query: string,
): ResolvedEntity {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return { status: "not_found", query };
  }

  const exact = entities.filter(
    (entity) => entity.name.trim().toLowerCase() === normalized,
  );
  if (exact.length === 1) {
    return { status: "ok", id: exact[0].id, name: exact[0].name };
  }
  if (exact.length > 1) {
    return {
      status: "ambiguous",
      matches: exact.map((entity) => ({ id: entity.id, name: entity.name })),
    };
  }

  const partial = entities.filter((entity) =>
    entity.name.trim().toLowerCase().includes(normalized),
  );
  if (partial.length === 1) {
    return { status: "ok", id: partial[0].id, name: partial[0].name };
  }
  if (partial.length > 1) {
    return {
      status: "ambiguous",
      matches: partial.map((entity) => ({ id: entity.id, name: entity.name })),
    };
  }

  return { status: "not_found", query };
}
