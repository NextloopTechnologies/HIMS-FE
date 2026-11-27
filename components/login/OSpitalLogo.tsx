import Image from "next/image";
// Transparent, trimmed copy of "OSpital Logo.png" (which has a white background).
import logo from "@/assets/logo/ospital-logo-transparent.png";

export default function OSpitalLogo() {
  return (
    <Image
      src={logo}
      alt="OSpital – The AI operating system for your hospital"
      priority
      className="mx-auto h-auto w-[240px]"
    />
  );
}
