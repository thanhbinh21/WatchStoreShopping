import { ProductCard } from "./components/ProductCard";
import ProductImg from "./assets/images/product.png";

function App() {
  return (
    <>
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
