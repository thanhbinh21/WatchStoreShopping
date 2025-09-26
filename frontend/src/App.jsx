import { useState } from "react";
import { Routes } from "react-router";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      {/* <Button
        variant="outline"
        onClick={() =>
          toast("Event has been created", {
            description: "Sunday, December 03, 2023 at 9:00 AM",
            action: {
              label: "Undo",
              onClick: () => console.log("Undo"),
            },
          })
        }
      >
        Show Toast
      </Button>

      <nav className="flex items-center gap-4 p-4 bg-gray-100">
        <IconClock size={28} stroke={2} className="text-blue-600" />
        <IconSearch size={24} className="cursor-pointer" />
        <IconShoppingCart size={24} className="cursor-pointer" />
        <IconUser size={24} className="cursor-pointer" />
        <IconHeart size={24} className="cursor-pointer text-red-500" />
      </nav>

      <nav className="flex items-center gap-4 p-4 bg-gray-100">
        <i className="las la-clock text-2xl text-blue-600"></i>
        <i className="las la-search text-xl cursor-pointer"></i>
        <i className="las la-shopping-cart text-xl cursor-pointer"></i>
        <i className="las la-user text-xl cursor-pointer"></i>
        <i className="las la-heart text-xl cursor-pointer text-red-500"></i>
      </nav> */}
      <Routes></Routes>
    </>
  );
}

export default App;
