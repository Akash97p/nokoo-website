import { api } from "../api.js";
import { h, mount, clear, pageHead, button, card, notice, icon, codeLine, busy, toggle, toast } from "../dom.js";

export default {
  async render(page, ctx) {
    const [o, settings] = await Promise.all([Promise.resolve(ctx.refreshOverview()).then((x) => x || api.get("overview")), api.get("settings")]);
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
            h("dt", { text: "Licence" }), h("dd", null, "Proprietary, under the ", link("https://nokooai.kabanitech.com/eula/", "End User Licence Agreement"), ". Provided as is, without warranty of any kind."),
            h("dt", { text: "Developer" }), h("dd", { text: "nokoo.ai is developed by Kabani Tech Private Limited. Author Akash P." })),
        ],
      }),
      usageCard(settings),
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
            link("https://nokooai.kabanitech.com/", "Website"),
            link("https://nokooai.kabanitech.com/docs/", "Documentation"),
            link("https://kabanitech.com/", "Kabani Tech Private Limited")),
        })));
  },
};

/** The one thing this app sends Kabani Tech on its own, and the switch that stops it (EULA §4). */
function usageCard(settings) {
  const status = h("div");
  const pings = toggle("Count this installation as active once a day", settings.usage_pings_enabled, {
    help: "Sends only a random installation id, the operating system and its version, the processor architecture, and the Nokoo version. Never your account, notifications, projects, or files, and your IP address is not stored.",
    onChange: async () => {
      try {
        await api.put("settings", { usage_pings_enabled: pings.input.checked });
        toast(pings.input.checked ? "Usage count turned on." : "Usage count turned off.");
      } catch (error) {
        pings.input.checked = !pings.input.checked;
        status.replaceChildren(notice(error.message, "danger"));
      }
    },
  });
  return card({ title: "Usage count", body: [pings, status] });
}
