async function main() {
  const apiBase = (process.env.NEXT_PUBLIC_API_URL ?? process.env.API_URL ?? "").replace(/\/$/, "");

  if (!apiBase) {
    throw new Error("NEXT_PUBLIC_API_URL or API_URL must be set to run seed.");
  }

  const response = await fetch(`${apiBase}/v1/admin/seed/default`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(process.env.ADMIN_SEED_TOKEN ? { Authorization: `Bearer ${process.env.ADMIN_SEED_TOKEN}` } : {}),
    },
    body: JSON.stringify({
      adminEmail: process.env.ADMIN_SEED_EMAIL,
      adminPassword: process.env.ADMIN_SEED_PASSWORD,
      githubUsername: process.env.GITHUB_USERNAME,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "Unknown error");
    throw new Error(`Seed failed (${response.status}): ${detail}`);
  }

  const data = await response.json();
  console.log("Seed completed:", data);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
