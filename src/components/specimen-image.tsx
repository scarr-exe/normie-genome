import Image from "next/image";
import { getSpecimenImage } from "@/lib/api";

type SpecimenImageProps = {
  id: string;
};

export function SpecimenImage({ id }: SpecimenImageProps) {
  return (
    <div className="specimen-frame">
      <Image
        src={getSpecimenImage(id)}
        alt={`Normie #${id}`}
        width={420}
        height={420}
        priority
        className="specimen-art"
      />
      <div className="scanline" />
    </div>
  );
}

