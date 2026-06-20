import Link from "next/link"
import Image from "next/image"

export default function Logo({ mono = false, className = "" }) {
  if (mono) {
    return (
      <Image
        src="/img/logo_simb_mono.png"
        alt="Agiliza"
        width={32}
        height={32}
        className={className}
      />
    )
  }

  return (
    <Link href="/" className={`block ${className}`}>
      <Image
        src="/img/logo_completa.png"
        alt="Agiliza"
        width={140}
        height={36}
        className="h-9 w-auto"
        priority
      />
    </Link>
  )
}
