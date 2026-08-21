import { CATEGORIES, EMPLOYMENT_TYPES, SORT_OPTIONS } from "../../data/constants";
import styles from "./JobFilters.module.css";

/**
 * 목록 위에 얹는 탐색 도구.
 * 값은 부모(Jobs 페이지)가 들고 있고 여기서는 조작만 한다 — 상태의 출처를 하나로 유지.
 */
export default function JobFilters({ value, onChange, onReset, resultCount, totalCount }) {
  const set = (patch) => onChange({ ...value, ...patch });
  const isFiltered =
    value.keyword !== "" || value.category !== "전체" || value.employmentType !== "전체";

  return (
    <section className={styles.panel} aria-label="공고 검색 및 필터">
      <div className={styles.searchRow}>
        <div className={styles.searchWrap}>
          <span className={styles.searchIcon} aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
              <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </span>
          <label className="sr-only" htmlFor="job-search">
            공고 검색
          </label>
          <input
            id="job-search"
            type="search"
            className={styles.search}
            placeholder="직무·회사·근무지로 검색"
            value={value.keyword}
            onChange={(e) => set({ keyword: e.target.value })}
          />
          {value.keyword && (
            <button
              type="button"
              className={styles.clear}
              onClick={() => set({ keyword: "" })}
              aria-label="검색어 지우기"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <div>
        <span className="sr-only" id="category-filter-label">
          직군 필터
        </span>
        <div className={styles.chips} role="group" aria-labelledby="category-filter-label">
          {["전체", ...CATEGORIES].map((cat) => (
            <button
              key={cat}
              type="button"
              className={[styles.chip, value.category === cat ? styles.chipOn : ""]
                .filter(Boolean)
                .join(" ")}
              aria-pressed={value.category === cat}
              onClick={() => set({ category: cat })}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.group}>
          <label className={styles.groupLabel} htmlFor="filter-employment">
            고용 형태
          </label>
          <select
            id="filter-employment"
            className={styles.select}
            value={value.employmentType}
            onChange={(e) => set({ employmentType: e.target.value })}
          >
            {["전체", ...EMPLOYMENT_TYPES].map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          <label className={styles.groupLabel} htmlFor="filter-sort">
            정렬
          </label>
          <select
            id="filter-sort"
            className={styles.select}
            value={value.sort}
            onChange={(e) => set({ sort: e.target.value })}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.group}>
          <p className={styles.count} aria-live="polite">
            전체 {totalCount}건 중 <strong>{resultCount}건</strong>
          </p>
          {isFiltered && (
            <button type="button" className={styles.reset} onClick={onReset}>
              조건 초기화
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
