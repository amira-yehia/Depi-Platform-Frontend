import { useState } from "react";
import "./ProfileTabs.css";

export default function ProfileTabs({ tabs, active, onTabChange }) {
  const [activeTab, setActiveTab] = useState(active || tabs?.[0]?.label || "");

  const handleClick = (label) => {
    setActiveTab(label);
    onTabChange?.(label);
  };

  return (
    <nav className="ptTabs">
      {tabs.map((t) => (
        <button
          key={t.label}
          type="button"
          className={`ptTab ${activeTab === t.label ? "is-active" : ""}`}
          onClick={() => handleClick(t.label)}
        >
          {t.label}
        </button>
      ))}
    </nav>
  );
}

// import "./ProfileTabs.css";

// export default function ProfileTabs({ tabs, active }) {
//   return (
//     <nav className="ptTabs">
//       {tabs.map((t) => (
//         <button
//           key={t.label}
//           type="button"
//           className={`ptTab ${active === t.label ? "is-active" : ""}`}
//         >
//           {t.label}
//         </button>
//       ))}
//     </nav>
//   );
// }
