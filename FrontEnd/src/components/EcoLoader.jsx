// Branded loading indicator for GreenGray Market — replaces the generic
// react-spinners ClipLoader.
//
// The old spinner rendered react-spinners' default black, uncentred, at
// the container's left edge: every call site passed
// className="color-cold-blue", which is not a real class (no such rule
// exists in index.css). This one is a sprouting seedling in the brand
// greens: the stem grows from the soil line and the two leaves sway.
// CSS-only (keyframes live in index.css), no new dependency.
//
// Centred by default; `label` tells the user what is loading, e.g.
// "Growing your products…", "Loading your cart…",
// "Watering the reviews…".
import PropTypes from "prop-types";

const SIZES = { sm: 40, md: 70, lg: 110 };

const EcoLoader = ({ size = "md", label }) => {
  const px = SIZES[size] || SIZES.md;
  return (
    <div
      className="flex flex-col items-center justify-center py-10"
      role="status"
      aria-label={label || "Loading"}
    >
      <svg
        width={px}
        height={px}
        viewBox="0 0 100 100"
        fill="none"
        aria-hidden="true"
      >
        {/* soil line */}
        <line
          x1="20"
          y1="88"
          x2="80"
          y2="88"
          stroke="#15803d"
          strokeWidth="4"
          strokeLinecap="round"
        />
        {/* stem — grows from the soil */}
        <path
          d="M50 88 C50 70 50 58 50 46"
          stroke="#16a34a"
          strokeWidth="5"
          strokeLinecap="round"
          className="eco-stem"
        />
        {/* left leaf */}
        <path
          d="M50 58 C36 58 26 48 26 34 C40 34 50 44 50 58 Z"
          fill="#16a34a"
          className="eco-leaf-left"
        />
        {/* right leaf */}
        <path
          d="M50 48 C64 48 74 38 74 24 C60 24 50 34 50 48 Z"
          fill="#15803d"
          className="eco-leaf-right"
        />
        {/* mint bud */}
        <circle cx="50" cy="18" r="4" fill="#8DECB4" className="eco-bud" />
      </svg>
      {label && (
        <p className="mt-3 text-sm font-semibold text-cold-blue">{label}</p>
      )}
    </div>
  );
};

EcoLoader.propTypes = {
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  label: PropTypes.string,
};

export default EcoLoader;
