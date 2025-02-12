import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { isDynamicServerError } from "next/dist/client/components/hooks-server-context";

async function loadGoogleFont(font: string, text: string) {
  const url = `https://fonts.googleapis.com/css2?family=${font}&text=${encodeURIComponent(
    text
  )}`;
  const css = await (await fetch(url)).text();
  const resource = css.match(/url\((.+)\) format\('(opentype|truetype)'\)/);

  if (resource) {
    const response = await fetch(resource[1]);
    if (response.status == 200) {
      return await response.arrayBuffer();
    }
  }

  throw new Error("failed to load font data");
}

export async function GET(request: NextRequest) {
  const { searchParams, origin, host } = request.nextUrl;
  const title = searchParams.get("title") || "";
  const profileImageUrl = `${origin}/profile.jpg`;
  const ogImageUrl = `${origin}/og.png`;
  try {
    return new ImageResponse(
      (
        <img
          tw="flex w-full h-full flex-col justify-end"
          src={ogImageUrl}
          width="1200"
          height="628"
          style={{
            objectFit: "cover",
            objectPosition: "center",
          }}
        >
          <img
            tw="absolute top-8 right-8 w-36 h-36 rounded-full"
            width="144"
            height="144"
            src={profileImageUrl}
            alt="Profile"
          />
          <div tw="flex flex-col p-8">
            <div tw="flex text-neutral-400 text-4xl mb-4">
              {host.replace("www.", "")}
            </div>
            <div tw="flex text-white text-6xl font-bold tracking-tighter max-w-[800px]">
              {title}
            </div>
          </div>
        </img>
      ),
      {
        width: 1200,
        height: 628,
        fonts: [
          {
            name: "Inter",
            data: await loadGoogleFont("Inter", title),
            style: "normal",
          },
        ],
      }
    );
  } catch (error) {
    if (isDynamicServerError(error)) {
      throw error;
    }
    return new Response("Failed to generate image", { status: 500 });
  }
}
