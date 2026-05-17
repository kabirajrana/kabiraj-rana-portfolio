import Link from "next/link";

export function ResearchListItem({ item }: { item?: any }) {
  return (
    <div className="border-b py-6">
      <Link href={`/research/${item?.slug ?? "#"}`} className="group">
        <h3 className="text-lg font-semibold group-hover:underline">
          {item?.title ?? "Untitled"}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {item?.summary ?? ""}
        </p>
      </Link>
    </div>
  );
}
