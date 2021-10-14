import React from "react";
import SockJsClient from "react-stomp";

class SampleComponent extends React.Component {
  render() {
    return (
      <div>
        <SockJsClient
          url="http://rmq.hoxwi.com:15673"
          topics={["Error"]}
          headers={{
            login: "disco",
            passcode: "D1sc@un1",
          }}
          onMessage={(msg: any) => {
            console.log(msg);
          }}
          onConnect={console.log}
          onDisconnect={console.log}
        />
        {console.log("teste")}
      </div>
    );
  }
}

export default SampleComponent;
