import type { Metadata } from "next";

type BaseMetadataInput = {
  title: string;
  description: string;
};

export function baseMetadata(input: BaseMetadataInput): Metadata {
  return {
    title: input.title,
    description: input.description,
    icons: {
      icon: "/icons/favicon-modified.png",
      shortcut: "/icons/favicon-modified.png",
      apple: "/icons/favicon-modified.png",
    },
    openGraph: {
      title: input.title,
      description: input.description,
      type: "website",
    },
  };
}
