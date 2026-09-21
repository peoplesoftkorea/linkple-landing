import { useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import styles from "./Modal.module.css";

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * 접근 가능한 모달.
 * ESC 닫기 · 배경 클릭 닫기 · 포커스 가두기 · 배경 스크롤 잠금까지 여기서 책임진다.
 * 화면마다 다시 구현하지 않도록 한 곳에 모았다.
 */
export default function Modal({ open, onClose, title, description, children, labelledBy }) {
  const dialogRef = useRef(null);
  const restoreFocusRef = useRef(null);
  const titleId = labelledBy ?? "modal-title";
  const descId = description ? `${titleId}-desc` : undefined;

  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;

      const nodes = dialogRef.current?.querySelectorAll(FOCUSABLE);
      if (!nodes?.length) return;

      const first = nodes[0];
      const last = nodes[nodes.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (!open) return undefined;

    restoreFocusRef.current = document.activeElement;
    document.body.classList.add("is-locked");

    // 열리면 첫 조작 지점으로 포커스를 옮긴다.
    // 닫기 버튼이 DOM상 먼저 오지만, 사용자가 할 일은 대개 입력이다.
    const timer = setTimeout(() => {
      const firstControl = dialogRef.current?.querySelector(
        "input:not([disabled]), textarea:not([disabled]), select:not([disabled])",
      );
      const fallback = dialogRef.current?.querySelectorAll(FOCUSABLE)?.[0];
      (firstControl ?? fallback ?? dialogRef.current)?.focus();
    }, 0);

    return () => {
      clearTimeout(timer);
      document.body.classList.remove("is-locked");
      restoreFocusRef.current?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div
      className={styles.overlay}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        ref={dialogRef}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
      >
        <div className={styles.header}>
          <div>
            <h2 className={styles.title} id={titleId}>
              {title}
            </h2>
            {description && (
              <p className={styles.desc} id={descId}>
                {description}
              </p>
            )}
          </div>
          <button type="button" className={styles.close} onClick={onClose} aria-label="닫기">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}
