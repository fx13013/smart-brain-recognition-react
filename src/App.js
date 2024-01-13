import { useState } from "react";
import "./App.css";
import ImageLinkForm from "./components/ImageLinkForm/ImageLinkForm";
import Logo from "./components/Logo/Logo";
import Navigation from "./components/Navigation/Navigation";
import Signin from "./components/Signin/Signin";
import Register from "./components/Register/Register";
import Rank from "./components/Rank/Rank";
import ParticlesBg from "particles-bg";
import FaceRecognition from "./components/FaceRecognition/FaceRecognition";

export const APIurl = "https://smart-brain-recognition-api.onrender.com";

function App() {
  const [input, setInput] = useState("");
  const [imageURL, setImageURL] = useState("");
  const [box, setBox] = useState({});
  const [route, setRoute] = useState("signin");
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [user, setUser] = useState({
    id: "",
    name: "",
    email: "",
    entries: 0,
    joined: "",
  });

  const onInputChange = (event) => {
    setInput(event.target.value);
  };

  const calculateFaceLocation = (data) => {
    const clarifaiFace =
      data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById("inputimage");
    const width = Number(image.width);
    const height = Number(image.height);
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - clarifaiFace.right_col * width,
      bottomRow: height - clarifaiFace.bottom_row * height,
    };
  };

  const displayBox = (box) => {
    setBox(box);
  };

  const onRouteChange = (route) => {
    if (route === "signout") {
      setIsSignedIn(false);
      setUser({});
      setImageURL("");
      setRoute("signin");
    } else if (route === "home") {
      setIsSignedIn(true);
    } else {
      setRoute(route);
    }
  };

  const handleButtonSubmit = () => {
    setImageURL(input);
    fetch(`${APIurl}/imageurl`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input,
      }),
    })
      .then((response) => response.json())
      .then((result) => {
        fetch(`${APIurl}/image`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: user.id,
          }),
        })
          .then((response) => response.json())
          .then((count) => setUser({ ...user, entries: count }))
          .catch(console.log);
        displayBox(calculateFaceLocation(result));
      })
      .catch((error) => console.log("error", error));
  };

  const handleLoadUser = (data) => {
    setUser({
      id: +data.id,
      name: data.name,
      email: data.email,
      entries: data.entries,
      joined: data.joined,
    });
  };

  return (
    <div className="App">
      <ParticlesBg type="cobweb" bg={true} />
      <Navigation isSignedIn={isSignedIn} onRouteChange={onRouteChange} />

      {isSignedIn ? (
        <>
          <Logo />
          <Rank name={user.name} entries={user.entries} />
          <ImageLinkForm
            onInputChange={onInputChange}
            onButtonSubmit={handleButtonSubmit}
          />
          <FaceRecognition box={box} imageURL={imageURL} />
        </>
      ) : (
        <>
          {route === "signin" && (
            <Signin onRouteChange={onRouteChange} onLoadUser={handleLoadUser} />
          )}
          {route === "register" && (
            <Register
              onRouteChange={onRouteChange}
              onLoadUser={handleLoadUser}
            />
          )}
        </>
      )}
    </div>
  );
}

export default App;
