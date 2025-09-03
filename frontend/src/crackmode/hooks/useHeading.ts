import { useEffect, useState } from "react";
import type { HeadingData } from "../types/docs";
import slugify from "slugify";

export function useHeadings(): HeadingData[] {
  const [headings, setHeadings] = useState<HeadingData[]>([]);

  useEffect(() => {
    const elements = Array.from(
      document.querySelectorAll("h2, h3, h4")
    ) as HTMLElement[];

    const idCountMap: Record<string, number> = {};

    const mapped = elements.map((el) => {
      let baseId = el.id || slugify(el.innerText, { lower: true, strict: true });

      // Ensure unique ID
      if (idCountMap[baseId]) {
        idCountMap[baseId] += 1;
        baseId = `${baseId}-${idCountMap[baseId]}`;
      } else {
        idCountMap[baseId] = 1;
      }

      // Update the element's id in the DOM to match the unique ID
      el.id = baseId;

      return {
        id: baseId,
        text: el.innerText,
        level: Number(el.tagName.replace("H", "")),
      };
    });

    setHeadings(mapped);
  }, []);

  return headings;
}
