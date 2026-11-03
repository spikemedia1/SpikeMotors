import { Showroom } from "@/components/showroom/showroom";
import { Salao } from "@/components/rooms/salao";
import { Colecao } from "@/components/rooms/colecao";
import { SpikeControl } from "@/components/rooms/spike-control";
import { Atelie } from "@/components/rooms/atelie";
import { Manifesto } from "@/components/rooms/manifesto";
import { Concierge } from "@/components/rooms/concierge";
import { NoScriptFallback } from "@/components/showroom/noscript";

export default function Page() {
  return (
    <>
      <Showroom
        content={{
          salao: <Salao />,
          colecao: <Colecao />,
          "spike-control": <SpikeControl />,
          atelie: <Atelie />,
          manifesto: <Manifesto />,
          concierge: <Concierge />,
        }}
      />
      <NoScriptFallback />
    </>
  );
}
