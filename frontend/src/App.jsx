import { useState } from "react";
import { SidebarItem } from "./components/SidebarItem";
import { sideBars } from "./lib/data";

function App() {
  const [activeIndex, setActiveIndex] = useState(0);

  // function onPress(isActive) {
  //   return isActive ? "false" : "true";
  // }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        height: "100vh",
        alignItems: "center",
        gap: 4,
      }}
    >
      {sideBars.map((item, index) => (
        <SidebarItem
          key={item.name}
          name={item.name}
          icon={item.icon}
          isActive={activeIndex === index}
          onClick={() => setActiveIndex(index)}
        />
      ))}
    </div>
  );
}

export default App;
