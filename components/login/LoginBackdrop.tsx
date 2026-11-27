import Image from "next/image";
import backdrop from "@/assets/Login Img.png";

export default function LoginBackdrop() {
  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden bg-[#A9D2E5]">
      <Image
        src={backdrop}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-right"
      />
    </div>
  );
}
