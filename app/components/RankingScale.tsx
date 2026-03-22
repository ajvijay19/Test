"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react";
import type { DbRating } from "@/app/lib/ratings";
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
  const [rows, setRows] = useState<DbRating[]>([]);
  const [loadState, setLoadState] = useState<"idle" | "loading" | "error">(
    "loading",
  );
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const refreshRatings = useCallback(async () => {
    setLoadState("loading");
    setLoadError(null);
    try {
      const res = await fetch("/api/ratings", { cache: "no-store" });
      const json = (await res.json()) as {
        ratings?: DbRating[];
        error?: string;
      };
      if (!res.ok) {
        setLoadState("error");
        setLoadError(json.error ?? `Request failed (${res.status})`);
        return;
      }
      setRows(json.ratings ?? []);
      setLoadState("idle");
    } catch (e) {
      setLoadState("error");
      setLoadError(e instanceof Error ? e.message : "Failed to load ratings");
    }
  }, []);

  useEffect(() => {
    void refreshRatings();
  }, [refreshRatings]);

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
          disabled={submitting}
          onClick={async () => {
            setStatus(null);
            setSubmitting(true);
            try {
              const res = await fetch("/api/ratings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ rating_value: rank }),
              });
              const json = (await res.json()) as {
                rating?: DbRating;
                error?: string;
              };
              if (!res.ok) {
                setStatus({
                  type: "error",
                  message: json.error ?? `Save failed (${res.status})`,
                });
                return;
              }
              if (json.rating) {
                setRows((prev) => [json.rating as DbRating, ...prev]);
              }
              setStatus({
                type: "success",
                message: `Saved rating ${rank} / 10`,
              });
              window.setTimeout(() => setStatus(null), 3500);
            } catch (e) {
              setStatus({
                type: "error",
                message:
                  e instanceof Error ? e.message : "Could not save rating",
              });
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {submitting ? "Saving…" : "Submit rating"}
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
          Ratings from the database
        </h2>
        <p className={styles.historyHint}>
          List load and submit go through this app&apos;s API, which reads and
          writes your Supabase <code className={styles.code}>public.ratings</code>{" "}
          table (newest first). Nothing is stored only in the browser.
        </p>
        {loadState === "loading" && rows.length === 0 ? (
          <p className={styles.historyHint}>Loading…</p>
        ) : loadState === "error" ? (
          <p className={styles.statusError}>
            {loadError ?? "Could not load ratings."}{" "}
            <button
              type="button"
              className={styles.linkButton}
              onClick={() => void refreshRatings()}
            >
              Retry
            </button>
          </p>
        ) : rows.length === 0 ? (
          <p className={styles.historyHint}>No rows yet. Submit a rating.</p>
        ) : (
          <ul className={styles.historyList}>
            {rows.map((r) => (
              <li key={String(r.id)} className={styles.historyItem}>
                <span className={styles.historyRank}>
                  {r.rating_value} / 10
                </span>
                <span className={styles.historyTime}>
                  {formatSubmittedAt(r.created_at)}
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
