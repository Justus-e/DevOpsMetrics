const app = require("./app");

const port = process.env.PORT || 8080;

if (process.env.TEST_MODE === "true") {
  require("./testmode");
}

app.listen(port, () => {
  console.log("server running at port: " + port);
  if (!process.env.PORT) {
    console.log(`Root: http://localhost:${port}/`);
    console.log(`Docs: http://localhost:${port}/swagger`);
  }
});
