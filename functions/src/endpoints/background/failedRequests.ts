import axios from "axios";


export async function excuteFailedRequest(data: { to: any; payload: any; headers: any; }){

  const { to, payload, headers } = data;

  for (let i = 0; i < 5; i++) {
    try {
      const data = await axios.post(to, payload, {
        headers,
      });
      console.log("status:", data.statusText, data.data.length > 5000);

      return;
    } catch (e) {
      console.log(e);
      console.log("Failed " + (i + 1));
    }
  }

}

