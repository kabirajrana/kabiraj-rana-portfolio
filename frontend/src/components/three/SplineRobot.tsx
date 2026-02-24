"use client";

import Spline from "@splinetool/react-spline";

const SPLINE_SCENE_URL = "https://prod.spline.design/70LNndbYpuGiiTDU/scene.splinecode";

export default function SplineRobot() {
  return (
    <div className="pointer-events-auto mx-auto flex w-full items-center justify-center md:max-w-[520px]">
      <div className="relative h-[260px] w-full overflow-hidden rounded-2xl bg-transparent sm:h-[340px] md:h-[520px] lg:h-[620px] xl:h-[700px]">
        <div className="absolute inset-0">
          <Spline scene={SPLINE_SCENE_URL} className="h-full w-full" />
        </div>
      </div>
    </div>
  );
}
