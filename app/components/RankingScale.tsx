"use client";

import Image from "next/image";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import {
  appendSubmission,
  loadSubmissions,
  type RankingSubmission,
} from "../lib/rankingStorage";
import styles from "./RankingScale.module.css";

const IMAGE_SRC = "/camera-rating.png";

const NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

function formatSubmittedAt(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

function RankingScale() {
  const [rank, setRank] = useState(5);
  const [submissions, setSubmissions] = useState<RankingSubmission[]>([]);
  const [status, setStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    setSubmissions(loadSubmissions());
  }, []);

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

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.submit}
          onClick={() => {
            try {
              const next = appendSubmission(rank);
              setSubmissions(next);
              setStatus({
                type: "success",
                message: `Saved rating ${rank} / 10`,
              });
              window.setTimeout(() => setStatus(null), 3500);
            } catch {
              setStatus({
                type: "error",
                message: "Could not save. Check browser storage settings.",
              });
            }
          }}
        >
          Submit rating
        </button>
        <p
          className={`${styles.status} ${status?.type === "error" ? styles.statusError : ""}`}
          role="status"
          aria-live="polite"
        >
          {status?.message ?? "\u00a0"}
        </p>
      </div>

      <section className={styles.history} aria-labelledby="saved-heading">
        <h2 id="saved-heading" className={styles.historyTitle}>
          Saved on this device
        </h2>
        <p className={styles.historyHint}>
          Submissions are stored in your browser (localStorage). They stay until
          you clear site data.
        </p>
        {submissions.length === 0 ? (
          <p className={styles.historyHint}>No submissions yet.</p>
        ) : (
          <ul className={styles.historyList}>
            {submissions.map((s) => (
              <li key={s.id} className={styles.historyItem}>
                <span className={styles.historyRank}>
                  {s.rank} / 10
                </span>
                <span className={styles.historyTime}>
                  {formatSubmittedAt(s.submittedAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default RankingScale;
