import "./go.css";
import { ProgressBar, Toc } from "./components/Toc";
import { Cover } from "./components/Cover";
import { PartOne } from "./components/sections/PartOne";
import { PartTwo } from "./components/sections/PartTwo";
import { PartThree } from "./components/sections/PartThree";
import { Footer } from "./components/Footer";

export default function GoProgramming() {
  return (
    <div className="go min-h-screen bg-go-paper font-mono text-go-ink antialiased">
      <ProgressBar />
      <Cover />

      <main className="mx-auto grid max-w-[1240px] grid-cols-1 gap-14 px-6 pb-4 pt-6 lg:px-10 xl:grid-cols-[230px_minmax(0,1fr)]">
        {/* below lg the wrapper dissolves so the mobile strip can stick for the whole article */}
        <div className="max-lg:contents">
          <Toc />
        </div>
        <div className="min-w-0">
          <PartOne />
          <PartTwo />
          <PartThree />
        </div>
      </main>

      <Footer />
    </div>
  );
}
