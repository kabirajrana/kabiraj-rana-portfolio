import Link from "next/link";

export function ResearchListItem({ item, entry }: { item?: any; entry?: any }) {
  const data = entry ?? item;
  return (
    <div className="border-b py-6">
      <Link href={`/research/${data?.slug ?? "#"}`} className="group">
        <h3 className="text-lg font-semibold group-hover:underline">
          {data?.title ?? "Untitled"}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {data?.summary ?? ""}
        </p>
      </Link>
    </div>
  );
}
