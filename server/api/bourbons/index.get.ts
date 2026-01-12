import { prisma } from "../../utils/prisma";

export default defineEventHandler(async (event) => {
  await requireUserSession(event);
  const query = getQuery(event);
  const search = query.search as string | undefined;

  const where = search
    ? {
      name: {
        contains: search,
        mode: "insensitive" as const,
      },
    }
    : {};

  const bourbons = await prisma.bourbon.findMany({
    where,
    orderBy: {
      name: "asc",
    },
    take: 50,
  });

  return { bourbons };
});
