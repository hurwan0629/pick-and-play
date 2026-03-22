import type { MetadataRoute } from 'next'

export default function manifast(): MetadataRoute.Manifest {
    return(
        {
            name: "Pick And Play",
            short_name: "PPlay",
            description: "게임 추천 앱",
            start_url: "/",
            display: "standalone",
            background_color: "#ffffff",
            theme_color: "#000000",
            icons: [
                {
                    src: "/icons/icon-192.png",
                    sizes: "192x192",
                    type: "image/png"
                },
                {
                    src: "/icons/icon-512.png",
                    sizes: "512x512",
                    type: "image/png"
                }
            ]
        }
    )
}