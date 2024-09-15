import { useState } from "react";
import "./App.css";

function App() {
  const [value, setValue] = useState("");

  const [image, setImage] = useState("");

  const handleSubmit = async () => {
    const url = "https://api-key.fusionbrain.ai/";
    const api_key = "8C2DC3B05F42C82509CA063F96C291F8";
    const secret_key = "5FCC8D5ACC4FDFA6FAEB5B04C91606FD";
    const authHeaders = {
      "X-Key": `Key ${api_key}`,
      "X-Secret": `Secret ${secret_key}`,
    };

    const params = {
      type: "GENERATE",
      num_images: 1,
      width: 1024,
      height: 1024,
      generateParams: {
        query: value,
      },
    };

    const modelResp = await fetch(url + "key/api/v1/models", {
      headers: authHeaders,
    });

    const modelJSON = await modelResp.json();

    const modelId = modelJSON[0]["id"];

    const formData = new FormData();
    formData.append("model_id", modelId);
    formData.append(
      "params",
      new Blob([JSON.stringify(params)], { type: "application/json" })
    );

    const resp = await fetch(url + "key/api/v1/text2image/run", {
      method: "POST",
      headers: { ...authHeaders },

      body: formData,
    });
    const res = await resp.json();
    const uuid = res["uuid"];

    let attempts = 100;
    while (attempts > 0) {
      const response = await fetch(
        url + `key/api/v1/text2image/status/${uuid}`,
        {
          method: "GET",
          headers: authHeaders,
        }
      );
      
      const data = await response.json();
      console.log(data)
      if (data.status === "DONE") {
        console.log(data.images);
        return;
      }

      attempts--;
      await new Promise((resolve) => setTimeout(resolve, 2 * 1000)); // Задержка в секундах
    }
  };

  return (
    <>
      <input value={value} onChange={(e) => setValue(e.target.value)} />
      <button onClick={handleSubmit}>Submit</button>
      <img src={atob(image)} height={1024} width={1024} />
    </>
  );
}

export default App;
