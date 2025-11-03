"use strict";

/**
 * This function retrieves the active tab and executes a script to show Product IDs (PIDs) on the page.
 * It queries the active tab, checks if it is a Search-Show page, and then prepends a div with the PID to each product tile.
 */
async function showPIDs() {
  let tabs = await chrome.tabs.query({ active: true });
  let tab = tabs[0];

  if (!tab) return;

  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => {
      let page = document.querySelector(".page[data-action=\"Search-Show\"]");

      if (!page) {
        alert("No Search-Show page found!");
        return;
      }

      let productTiles = page.querySelectorAll(".product-grid .product[data-pid]");

      /**
             * Prepend a div to the tile with the PID
             * @param {Element} tile - The tile element
             * @param {string} pid - The Product ID
             */
      let prependDivToTile = (tile, pid) => {
        let wrapper = tile.querySelector(".product-tile .tile-body");
        if (!wrapper) {
          return;
        }
        let curDiv = wrapper.querySelector(".product-tile-pid");
        if (curDiv) {
          curDiv.remove();
        }
        let div = document.createElement("div");

        div.style.color = "red";
        div.style.fontWeight = "bold";
        div.classList.add("product-tile-pid");
        div.innerText = pid;

        wrapper.prepend(div);
      };

      Array.from(productTiles).map(tile => {
        let pid = tile.querySelector(".image-container a")?.href;
        prependDivToTile(tile, pid.split("/").pop());
        return pid;
      });
    },
    world: "MAIN"
  });
}

document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("showPIDs")?.addEventListener("click", function () {
    showPIDs();
  });
});
