import styles from "./Card.module.css";

export default function Card({
  as: Tag = "div",
  padded = true,
  interactive = false,
  className = "",
  children,
  ...rest
}) {
  return (
    <Tag
      className={[
        styles.card,
        padded ? styles.padded : "",
        interactive ? styles.interactive : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      {children}
    </Tag>
  );
}
