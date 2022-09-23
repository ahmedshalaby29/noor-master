import grapesjs from "grapesjs";
import "./builder.css";

import React, { useEffect, useState } from "react";

import "grapesjs-preset-webpage";
import "grapesjs-blocks-flexbox";
import { useRef } from "react";
import { useLayoutEffect } from "react";

import axios from "axios";

async function publish(html, style) {
  await axios.post("api/html", { html, style });
}

async function get() {
  const { data } = await axios.get("api/html");
  return data;
}

const Builder = () => {
  const editor = useRef(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    get().then(setData);
  }, []);

  useLayoutEffect(() => {
    if (data && !editor.current) {
      editor.current = grapesjs.init({
        // Indicate where to init the editor. You can also pass an HTMLElement
        container: "#editor",
        // Get the content for the canvas directly from the element
        components: data.html,
        style: data.style,
        // Disable the storage manager for the moment
        storageManager: {
          autosave: false,
        },

        plugins: ["gjs-preset-webpage", "gjs-blocks-flexbox"],
      });

      editor.current.load(() => {
        console.log("loading...");
      });

      setTimeout(() => {
        console.log(editor.current);
      }, 1000);
    }
  }, [data]);

  function save() {
    const html = editor.current.getHtml();
    const css = editor.current.getCss();
    publish(html, css);
  }

  return (
    <div style={{ position: "relative" }}>
      <div id="editor">Loading</div>
      <button
        onClick={() => {
          save();
        }}
        className="fixed bottom-10 right-10 rounded-full aspect-square p-2 z-50 bg-fuchsia-700 text-sm font-bold text-white shadow-lg"
      >
        save
      </button>
    </div>
  );
};

export default Builder;
