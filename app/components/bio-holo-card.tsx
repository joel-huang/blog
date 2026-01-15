"use client"

import { useEffect, useState } from "react"
import HolographicSticker from "holographic-sticker"

export function BioHoloCard() {
    const [mounted, setMounted] = useState(false)
    const scale = 1.1
    const objectFit = "cover"

    useEffect(() => {
        setMounted(true)
    }, [])

    return (
        <div data-bio-holo-card className="w-full p-4 xl:absolute xl:bottom-0 xl:left-0 xl:w-auto">
            <div className="h-full flex items-center justify-center" style={{ overflow: "visible", touchAction: "none" }}>
                <HolographicSticker.Root className="select-none h-full flex items-center justify-center touch-enabled">
                    <HolographicSticker.Scene className="h-full flex items-center justify-center touch-enabled">
                        <HolographicSticker.Card className="h-full touch-enabled">
                            {/* Layer 1: Base image */}
                            <div style={{ opacity: mounted ? 1 : 0, transition: "opacity 0.5s ease-in", position: "absolute", inset: 0 }}>
                                <HolographicSticker.ImageLayer
                                    src="/profile-real.png"
                                    alt="Joel Huang"
                                    parallax={true}
                                    objectFit={objectFit}
                                    scale={scale}
                                />
                            </div>

                            <HolographicSticker.Watermark
                                imageUrl="/holo.png"
                                opacity={1}
                            >
                                <HolographicSticker.Refraction intensity={1} />
                            </HolographicSticker.Watermark>

                            {/* Layer 3: Content with custom emboss frame */}
                            <HolographicSticker.Content>
                                <div
                                    style={{
                                        position: "absolute",
                                        inset: 0,
                                        filter: "url(#hologram-lighting)",
                                        opacity: mounted ? 1 : 0,
                                        transition: "opacity 0.7s ease-in 0.2s",
                                    }}
                                >
                                    {/* Emboss border */}
                                    <div
                                        style={{
                                            position: "absolute",
                                            inset: "-1px",
                                            border: "calc((1rem * 0.5) + 1px) solid #222",
                                            borderRadius: "1rem",
                                            zIndex: 3,
                                        }}
                                    />

                                    {/* Name and title */}
                                    <div
                                        style={{
                                            position: "absolute",
                                            top: "1rem",
                                            left: "1rem",
                                            textAlign: "left",
                                            letterSpacing: "-0.05em",
                                            fontWeight: 1000,
                                            lineHeight: 1,
                                            zIndex: 100,
                                            margin: 0,
                                        }}
                                    >
                                        <span
                                            style={{
                                                filter: "url(#hologram-sticker)",
                                                fontSize: "1.25rem",
                                                display: "block",
                                                color: "#111",
                                            }}
                                        >
                                            Joel Huang
                                        </span>
                                        <span
                                            style={{
                                                filter: "url(#hologram-sticker)",
                                                fontSize: "0.8rem",
                                                display: "block",
                                                color: "#111",
                                            }}
                                        >
                                            Head of AI @ Bifrost
                                        </span>
                                    </div>

                                    {/* Signature */}
                                    <img
                                        src="/signature.png"
                                        alt="Signature"
                                        style={{
                                            position: "absolute",
                                            zIndex: 2,
                                            width: "200px",
                                            bottom: "0px",
                                            right: "calc(1rem * -5)",
                                            rotate: "5deg",
                                            opacity: mounted ? 0.9 : 0,
                                            transition: "opacity 0.7s ease-in 0.2s",
                                            filter: "brightness(0) invert(1)",
                                            scale: 1.7,
                                        }}
                                    />

                                    {/* Bifrost Logo */}
                                    <div
                                        style={{
                                            position: "absolute",
                                            width: "calc(1rem * 2.75)",
                                            bottom: "calc(1rem * 1)",
                                            left: "calc(1rem * 1)",
                                            zIndex: 100,
                                        }}
                                    >
                                        <img
                                            src="/bifrost.png"
                                            alt="Bifrost"
                                            style={{
                                                width: "100%",
                                                height: "auto",
                                                filter: "drop-shadow(-1px -1px 0 white) drop-shadow(1px -1px 0 white) drop-shadow(-1px 1px 0 white) drop-shadow(1px 1px 0 white) drop-shadow(0 -1px 0 white) drop-shadow(-1px 0 0 white) drop-shadow(1px 0 0 white) drop-shadow(0 1px 0 white)",
                                            }}
                                        />
                                    </div>

                                    {/* Portrait image */}
                                    <HolographicSticker.ImageLayer
                                        src="/profile-real-bg-removed.png"
                                        alt=""
                                        parallax={true}
                                        objectFit={objectFit}
                                        scale={scale}
                                    />
                                </div>
                            </HolographicSticker.Content>

                            {/* Layer 4: Spotlight */}
                            <div style={{ opacity: mounted ? 0.5 : 0, transition: "opacity 0.5s ease-in 0.3s", position: "absolute", inset: 0, pointerEvents: "none" }}>
                                <HolographicSticker.Spotlight />
                            </div>
                        </HolographicSticker.Card>
                    </HolographicSticker.Scene>

                    {/* SVG Filters */}
                    <svg className="sr-only" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <filter id="hologram-lighting">
                                <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur" />
                                <feSpecularLighting
                                    result="lighting"
                                    in="blur"
                                    surfaceScale="8"
                                    specularConstant="12"
                                    specularExponent="120"
                                    lightingColor="hsl(0 0% 6%)"
                                >
                                    <fePointLight x="50" y="50" z="300" />
                                </feSpecularLighting>
                                <feComposite
                                    in="lighting"
                                    in2="SourceAlpha"
                                    operator="in"
                                    result="composite"
                                />
                                <feComposite
                                    in="SourceGraphic"
                                    in2="composite"
                                    operator="arithmetic"
                                    k1="0"
                                    k2="1"
                                    k3="1"
                                    k4="0"
                                    result="litPaint"
                                />
                            </filter>
                            <filter id="hologram-sticker">
                                <feMorphology
                                    in="SourceAlpha"
                                    result="dilate"
                                    operator="dilate"
                                    radius="2"
                                />
                                <feFlood floodColor="hsl(0 0% 100%)" result="outlinecolor" />
                                <feComposite
                                    in="outlinecolor"
                                    in2="dilate"
                                    operator="in"
                                    result="outlineflat"
                                />
                                <feMerge result="merged">
                                    <feMergeNode in="outlineflat" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>
                        </defs>
                    </svg>
                </HolographicSticker.Root>
            </div>
        </div >
    )
}
