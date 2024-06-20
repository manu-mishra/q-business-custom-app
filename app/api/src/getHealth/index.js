exports.handler = async (event) => {
  console.log("request:", JSON.stringify(event, undefined, 2));
const requestHeaders = event.headers;
  return {
    statusCode: 200,
    body: JSON.stringify({ 
      message: "Hello world",
      recievedHeaders:requestHeaders
    }),
  };
};