import "./ReusableCard.css";

function ReusableCard({
  as: Component = "div",
  variant = "dark",
  hover = true,
  className = "",
  children,
  ...props
}) {
  const classes = [
    "reusableCard",
    `reusableCard--${variant}`,
    hover ? "reusableCard--hover" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Component className={classes} {...props}>
      {children}
    </Component>
  );
}

export default ReusableCard;