import * as slint from "npm:slint-ui@1.7.2";

interface App {
  clients: Client[];
  calcTotal: () => string;
  addClient: (name: string, honoraire: string) => void;
  removeClient: (client: Client) => void;
  startsWith: (str: string, prefix: string) => boolean;
  run: () => Promise<void>;
}

interface Client {
  name: string;
  honoraire: number;
}

function saveClients(clients: Client[]) {
  localStorage.setItem("clients", JSON.stringify(clients));
}
function loadClients(): Client[] {
  const clients = localStorage.getItem("clients");
  if (!clients) return [];
  return JSON.parse(clients);
}

if (import.meta.main) {
  const ui = slint.loadFile("./calc.slint");
  // deno-lint-ignore no-explicit-any
  const app = new (ui as any).App() as App;

  app.calcTotal = function () {
    let totalClients = 0;
    let totalCertif = 0;

    for (const client of app.clients) {
      if (client.name.startsWith("c ")) {
        totalCertif += client.honoraire;
      } else {
        totalClients += client.honoraire;
      }
    }

    return `Total clients: ${totalClients.toFixed(2)}
Total certificats: ${totalCertif.toFixed(2)}
Total: ${(totalClients + totalCertif).toFixed(2)}`;
  };
  app.addClient = function (name, honoraire) {
    if (!name || !honoraire) return;
    const newClients = [...app.clients, {
      name,
      honoraire: parseFloat(honoraire),
    }];
    app.clients = newClients;
    saveClients(newClients);
  };
  app.removeClient = function (client) {
    const newClients = [...app.clients].filter((c) =>
      c.name !== client.name || c.honoraire !== client.honoraire
    );
    app.clients = newClients;
    saveClients(newClients);
  };
  app.startsWith = function (str, prefix) {
    return str.startsWith(prefix);
  };

  app.clients = loadClients();
  await app.run();
}
