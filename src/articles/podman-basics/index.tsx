import "./pd.css";
import { Column, DocProvider, Rail, TopStrip } from "./components/chrome";
import { Cover, S01, S02, S03 } from "./sections/part1";
import { S04, S05, S06 } from "./sections/part2";
import { Footer, S07, S08, S09, S10 } from "./sections/part3";

export default function PodmanBasics() {
  return (
    <div className="pd min-h-screen bg-pd-paper font-mono text-pd-ink antialiased">
    <DocProvider>
      <TopStrip />
      <Rail />
      <main className="pt-8 lg:pl-60">
        <Column>
          <Cover />
          <S01 />
          <S02 />
          <S03 />
          <S04 />
          <S05 />
          <S06 />
          <S07 />
          <S08 />
          <S09 />
          <S10 />
        </Column>
        <Footer />
      </main>
    </DocProvider>
    </div>
  );
}
