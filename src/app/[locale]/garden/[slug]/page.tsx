interface GardenPageProps {
  params: Promise<{ slug: string; locale: string }>;
}

export default async function GardenPage({ params }: GardenPageProps) {
  const { slug } = await params;

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl md:text-4xl font-bold text-green-400 mb-4">
        Startup Garden
      </h1>
      <p className="text-green-200 mb-8">Viewing garden for: {slug}</p>
      <div className="bg-green-900/30 border border-green-700 rounded-lg p-8 text-center">
        <p className="text-green-300">Garden visualization coming soon</p>
      </div>
    </main>
  );
}
