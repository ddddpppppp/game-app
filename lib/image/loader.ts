export default function imageLoader({ src, quality }: { src: string, quality: number }) {
    return `https://cdn.game-hub.cc${src}?&q=${quality || 75}`
}
