import { ImageResponse } from "next/og";
import { MakerGardenService } from "@/lib/services/garden";

export const runtime = "edge";

/**
 * GET /api/share/maker/[xHandle]
 * Generates an OG image for a maker's garden (social sharing)
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ xHandle: string }> }
) {
  const { xHandle } = await params;

  try {
    // Fetch maker garden data
    const makerGardenService = new MakerGardenService();
    const garden = await makerGardenService.buildGarden(xHandle);

    if (!garden) {
      return generateNotFoundImage();
    }

    // Format display values
    const mrrFormatted = formatMRR(garden.totalMRR);
    const customersFormatted = garden.totalCustomers.toLocaleString();
    const displayName = garden.xName ?? `@${garden.xHandle}`;
    const productCountText = `${garden.totalProducts} product${garden.totalProducts === 1 ? "" : "s"}`;

    // Get garden size emoji
    const sizeEmojis: Record<string, string> = {
      small: "🌱",
      medium: "🌿",
      large: "🌳",
      estate: "🌲",
    };
    const sizeEmoji = sizeEmojis[garden.gardenSize] ?? "🌳";

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
              gap: "20px",
              zIndex: 1,
            }}
          >
            {/* Avatar placeholder with first letter */}
            <div
              style={{
                width: 100,
                height: 100,
                borderRadius: 50,
                backgroundColor: "#22c55e",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 50,
                fontWeight: "bold",
                color: "#0f172a",
                border: "4px solid #4ade80",
              }}
            >
              {displayName.charAt(0).toUpperCase()}
            </div>

            {/* Maker Name */}
            <div
              style={{
                fontSize: 56,
                fontWeight: 800,
                color: "#ffffff",
                textAlign: "center",
                maxWidth: "900px",
                textShadow: "0 2px 10px rgba(0,0,0,0.5)",
              }}
            >
              {displayName}
            </div>

            {/* Product count badge */}
            <div
              style={{
                fontSize: 28,
                color: "#4ade80",
                fontWeight: 600,
              }}
            >
              {sizeEmoji} {productCountText}
            </div>

            {/* Total MRR */}
            <div
              style={{
                fontSize: 72,
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
    console.error("Maker share card generation error:", error);
    return generateErrorImage();
  }
}

/**
 * Generate a "not found" image
 */
function generateNotFoundImage(): ImageResponse {
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
        <div style={{ fontSize: 80, marginBottom: 20 }}>🌱</div>
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
          Maker not found
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}

/**
 * Generate an error fallback image
 */
function generateErrorImage(): ImageResponse {
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

/**
 * Format MRR for display
 */
function formatMRR(mrrCents: number): string {
  const mrr = mrrCents / 100;
  if (mrr >= 1_000_000) {
    return `$${(mrr / 1_000_000).toFixed(1)}M/mo`;
  }
  if (mrr >= 1_000) {
    return `$${(mrr / 1_000).toFixed(1)}k/mo`;
  }
  return `$${Math.round(mrr)}/mo`;
}
