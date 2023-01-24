import React from "react";
import { render } from "react-dom";
import Content from "./content";
const body = document.querySelector("body");

const app = document.createElement("div");

app.id = "root-link";
if (body) {
  body.prepend(app);
}
let text;
chrome.storage.local.get(["linkedInProfileFav"]).then((response) => {
  const list = response.linkedInProfileFav || {};
  const regex = new RegExp(
    "(https?://(www.|de.)?linkedin.com/(mwlite/|m/)?in/([a-zA-Z0-9À-ž_.-]+)/?)"
  );
  const result = regex.exec(location.href);

  if (result && list[result[4]]) {
    text = document.createTextNode("Added to Bucket !");
  } else {
    text = document.createTextNode("Add to Bucket !");
  }
  const button = document.createElement("button");
  button.appendChild(text);
  button.className = "button is-link is-medium";
  button.id = "linkedin-extension-button";
  button.onclick = () => {
    document
      .getElementById("linkedin-fav-extension")
      .classList.add("is-active");
  };
  document.querySelector(".pv-text-details__left-panel")?.appendChild(button);
});

render(<Content></Content>, document.getElementById("root-link"));
