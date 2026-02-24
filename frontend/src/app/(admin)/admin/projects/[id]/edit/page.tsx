type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditProjectPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <main>
      <h1>Edit Project: {id}</h1>
    </main>
  );
}
