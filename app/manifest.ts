import { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Oreo Finance',
    short_name: 'Oreo Finance',
    description: 'A personal finance tracker with a pixel cat mascot.',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#565676', // Slate Purple
    icons: [
      {
        src: '/oreo.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/oreo.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
