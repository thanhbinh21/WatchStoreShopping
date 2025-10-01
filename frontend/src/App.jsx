import ProductImg from "./assets/images/product.png";
import { ProductCard } from "./components/Admin/ProductCard";
import { TopBar } from "./components/Admin/TopBar";

function App() {
  return (
    <>
      <TopBar />
      <ProductCard
        image={ProductImg}
        name={"Apple Watch Series 4"}
        price={"1.000.000"}
        rating={4.5}
        numOfRating={123}
      />
    </>
  );
}

export default App;
