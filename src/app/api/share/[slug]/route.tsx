import { ImageResponse } from "next/og";
import { TrustMRRProvider } from "@/lib/providers/trustmrr";
import { TreeService } from "@/lib/services/tree";

export const runtime = "edge";

/**
 * GET /api/share/[slug]
 * Generates an OG image for social sharing
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    // Fetch startup data
    const provider = new TrustMRRProvider();
    const treeService = new TreeService();
    const { response } = await provider.getStartup(slug);
    const startup = response.data;
    const treeData = treeService.mapToTreeData(startup);

    // Format MRR
    const mrrFormatted = `$${(startup.revenue.mrr / 100 / 1000).toFixed(1)}k/mo`;
    const customersFormatted = startup.customers.toLocaleString();

    // Get tier info
    const tierEmojis: Record<string, string> = {
      seed: "🌱",
      sprout: "🌿",
      shrub: "🪴",
      young: "🌳",
      mature: "🌲",
      great: "🎄",
      ancient: "🌴",
      world: "🌍",
    };
    const tierNames: Record<string, string> = {
      seed: "Seed",
      sprout: "Sprout",
      shrub: "Shrub",
      young: "Young Tree",
      mature: "Mature Tree",
      great: "Great Tree",
      ancient: "Ancient Tree",
      world: "World Tree",
    };

    const tierEmoji = tierEmojis[treeData.tier] ?? "🌱";
    const tierName = tierNames[treeData.tier] ?? treeData.tier;

    return new ImageResponse(
      (
        <div
          style={{
            width: "1200",
            height: "630",
            background: "linear-gradient(135deg, #0f172a 0%, #064e3b 50%, #0f172a 100%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "60px",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          {/* Background pattern */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              opacity: 0.1,
              backgroundImage: `radial-gradient(circle at 20% 50%, #22c55e 0%, transparent 50%),
                               radial-gradient(circle at 80% 80%, #16a34a 0%, transparent 50%)`,
            }}
          />

          {/* Content */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "24px",
              zIndex: 1,
            }}
          >
            {/* Icon */}
            {startup.icon ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={startup.icon}
                alt=""
                width={100}
                height={100}
                style={{
                  borderRadius: "20px",
                  border: "3px solid #22c55e",
                }}
              />
            ) : (
              <div
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 20,
                  backgroundColor: "#1f2937",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 50,
                  border: "3px solid #22c55e",
                }}
              >
                🌳
              </div>
            )}

            {/* Startup Name */}
            <div
              style={{
                fontSize: 60,
                fontWeight: 800,
                color: "#ffffff",
                textAlign: "center",
                maxWidth: "900px",
                textShadow: "0 2px 10px rgba(0,0,0,0.5)",
              }}
            >
              {startup.name}
            </div>

            {/* MRR */}
            <div
              style={{
                fontSize: 80,
                fontWeight: 700,
                color: "#4ade80",
                textAlign: "center",
              }}
            >
              {mrrFormatted}
            </div>

            {/* Stats row */}
            <div
              style={{
                display: "flex",
                gap: "40px",
                alignItems: "center",
                marginTop: "10px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  backgroundColor: "rgba(255,255,255,0.1)",
                  padding: "12px 24px",
                  borderRadius: "12px",
                }}
              >
                <span style={{ fontSize: 32 }}>👥</span>
                <span style={{ fontSize: 28, color: "#ffffff" }}>
                  {customersFormatted} customers
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  backgroundColor: "rgba(255,255,255,0.1)",
                  padding: "12px 24px",
                  borderRadius: "12px",
                }}
              >
                <span style={{ fontSize: 32 }}>{tierEmoji}</span>
                <span style={{ fontSize: 28, color: "#ffffff" }}>{tierName}</span>
              </div>
            </div>

            {/* Branding */}
            <div
              style={{
                position: "absolute",
                bottom: 40,
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <span style={{ fontSize: 32 }}>🌳</span>
              <span
                style={{
                  fontSize: 28,
                  color: "#4ade80",
                  fontWeight: 600,
                }}
              >
                Garden of Makers
              </span>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        headers: {
          "Cache-Control": "public, max-age=86400",
        },
      }
    );
  } catch (error) {
    console.error("Share card generation error:", error);

    // Return a fallback image
    return new ImageResponse(
      (
        <div
          style={{
            width: "1200",
            height: "630",
            background: "linear-gradient(135deg, #0f172a 0%, #064e3b 50%, #0f172a 100%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <div style={{ fontSize: 80, marginBottom: 20 }}>🌳</div>
          <div
            style={{
              fontSize: 50,
              fontWeight: 700,
              color: "#4ade80",
            }}
          >
            Garden of Makers
          </div>
          <div
            style={{
              fontSize: 30,
              color: "#9ca3af",
              marginTop: 20,
            }}
          >
            Explore the forest of startups
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  }
}
