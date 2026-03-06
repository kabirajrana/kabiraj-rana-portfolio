import { Container } from "@/components/layout/container";

export default function Loading() {
  return (
    <Container className="py-24">
      <div className="glass mx-auto h-48 max-w-3xl animate-pulse rounded-2xl" />
    </Container>
  );
}