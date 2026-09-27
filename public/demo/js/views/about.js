import { api } from "../api.js";
import { h, mount, clear, pageHead, button, card, notice, icon, codeLine, busy } from "../dom.js";

export default {
  async render(page, ctx) {
    const o = await ctx.refreshOverview() || await api.get("overview");
    const prerelease = String(o.version).includes("-");

    const link = (href, label) => h("a", { href, target: "_blank", rel: "noopener noreferrer", class: "row" }, icon("external"), label);

    mount(page, 
      pageHead("About", "Nokoo is the local human-attention broker for coding agents."),
      card({
        body: [
          h("div", { class: "row" }, h("img", { src: "favicon.svg", alt: "", width: 44, height: 44 }),
            h("div", null, h("h2", { class: "page-title", text: "Nokoo" }), h("p", { class: "muted mono", text: `Version ${o.version}` }))),
          prerelease ? notice("This is a prerelease build. Expect incomplete features and breaking changes.", "warn") : null,
          h("dl", { class: "kv" },
            h("dt", { text: "Data folder" }), h("dd", { class: "mono small", text: o.data_directory }),
            h("dt", { text: "Local API" }), h("dd", { class: "mono small", text: o.api_url }),
            h("dt", { text: "Licence" }), h("dd", { text: "Proprietary. Provided as is, without warranty of any kind." }),
            h("dt", { text: "Developer" }), h("dd", { text: "nokoo.ai is developed by Kabani Tech Private Limited. Author Akash P." })),
        ],
      }),
      h("div", { class: "grid-2" },
        card({
          title: "Local first",
          body: [
            h("p", { class: "muted", text: "History, questions, and channel credentials live on this computer. This page is served by the broker itself, only to this machine, and never receives a stored credential back." }),
            h("p", { class: "muted", text: "Open it again at any time with:" }),
            codeLine("nokoo ui"),
          ],
        }),
        card({
          title: "Links",
          body: h("div", { class: "stack" },
            link("https://nokoo.ai/", "Website"),
            link("https://nokoo.ai/docs/", "Documentation"),
            link("https://kabanitech.com/", "Kabani Tech Private Limited")),
        })));
  },
};
