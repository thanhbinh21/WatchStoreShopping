import { UserInfo } from "./components/UserInfo";
import UserImage from "./assets/images/user.svg";

function App() {
  return (
    <>
      <UserInfo name={"Test name"} image={UserImage} role={"Admin"} />
    </>
  );
}

export default App;
