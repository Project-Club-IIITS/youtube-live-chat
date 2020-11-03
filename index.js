const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();

app.disable("strict routing");
app.disable("x-powered-by");
app.enable("case sensitive routing");
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.get(["/", "/index.html", "/index.htm"], (req, res, next) => {
  let api_key = req.query.key;
  let client_id = req.query.id;
  if (typeof api_key !== "string" || typeof client_id != "string") {
    res.sendFile("home.html", { root: path.join(__dirname, "views") });
  } else {
    res.render("home.ejs", {
      GOOGLE_CLIENT_ID: client_id,
      GOOGLE_API_KEY: api_key,
    });
  }
});

app.post("/", bodyParser.urlencoded({ extended: false }), (req, res, next) => {
  let api_key = req.body.api_key;
  let client_id = req.body.client_id;
  if (typeof api_key !== "string" || typeof client_id != "string") {
    res.redirect("/");
  } else {
    res.redirect(
      `/?key=${encodeURIComponent(api_key)}&id=${encodeURIComponent(client_id)}`
    );
  }
});

app.use("/css", express.static("css"));
app.use("/js", express.static("js"));
app.use("/favicon", express.static("favicon"));

app.listen(5500);
