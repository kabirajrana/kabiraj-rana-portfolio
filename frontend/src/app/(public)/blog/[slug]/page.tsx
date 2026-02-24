type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  return (
    <main>
      <h1>Post: {slug}</h1>
    </main>
  );
}
