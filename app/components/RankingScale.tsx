"use client";

import Image from "next/image";
import { useMemo, useState, type CSSProperties } from "react";
import styles from "./RankingScale.module.css";

const IMAGE_SRC = encodeURI(
  "/Screenshot 2024-11-18 at 2.08.06\u202fPM.png",
);

const NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

export function RankingScale() {
  const [rank, setRank] = useState(5);

  const sliderStyle = useMemo(
    () => ({ "--rank": rank } as CSSProperties & { "--rank": number }),
    [rank],
  );

  return (
    <div className={styles.wrap}>
      <Image
        className={styles.photo}
        src={IMAGE_SRC}
        alt="Front view of a black Sony Alpha 7 mirrorless camera with an E-mount lens cap"
        width={1600}
        height={1200}
        sizes="(max-width: 42rem) 100vw, 42rem"
        priority
      />

      <div className={styles.scale}>
        <p className={styles.scaleLabel}>Ranking scale</p>
        <div className={styles.track}>
          {NUMBERS.map((n) => (
            <div
              key={n}
              className={`${styles.tick} ${n === rank ? styles.tickActive : ""}`}
            >
              <span className={styles.tickMark} aria-hidden />
              <button
                type="button"
                className={`${styles.num} ${n === rank ? styles.numActive : ""}`}
                onClick={() => setRank(n)}
                aria-pressed={n === rank}
                aria-label={`Rank ${n} out of 10`}
              >
                {n}
              </button>
            </div>
          ))}
        </div>

        <div className={styles.sliderRow}>
          <span className={styles.sliderLabel} id="rank-slider-label">
            Adjust
          </span>
          <input
            id="rank-slider"
            className={styles.slider}
            style={sliderStyle}
            type="range"
            min={1}
            max={10}
            step={1}
            value={rank}
            onChange={(e) => setRank(Number(e.target.value))}
            aria-valuemin={1}
            aria-valuemax={10}
            aria-valuenow={rank}
            aria-labelledby="rank-slider-label"
          />
        </div>
      </div>

      <p className={styles.readout} aria-live="polite">
        Rating: {rank} / 10
      </p>
    </div>
  );
}
