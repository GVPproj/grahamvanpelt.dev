"use client";

import { useEffect, useState } from "react";

const toolList = [
  "ReactJS",
  "Accessible UI",
  "Typescript",
  "Graphql",
  "Postgres",
  "TailwindCSS",
  "Astro",
  "Prisma",
  "HTML",
  "Remix",
];

export default function SpanCycle() {
  const [listIdx, setListIdx] = useState(0);

  useEffect(() => {
    const handleTimeout = () => {
      if (listIdx < toolList.length - 1) setListIdx((prev) => prev + 1);
      else setListIdx(0);
    };
    const timer = setTimeout(handleTimeout, 2000);
    return () => clearTimeout(timer);
  }, [listIdx]);

  return <span className="text-skin-accent">{toolList[listIdx]}</span>;
}
