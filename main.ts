import * as slint from "npm:slint-ui@1.7.2";

interface App {
  clients: Client[];
  calcTotal: () => string;
  addClient: (name: string, honoraire: string) => void;
  removeClient: (id: number) => void;
  removeAllClients: () => void;
  startsWith: (str: string, prefix: string) => boolean;
  run: () => Promise<void>;
}

interface Client {
  id: number;
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

function maxInArray(array: number[]): number {
  let max = -1;
  for (const elem of array) {
    if (max < elem) max = elem;
  }
  return max;
}

if (import.meta.main) {
  Deno.env.set("WAYLAND_DISPLAY", "");
  const ui = slint.loadFile("./calc.slint");
  // deno-lint-ignore no-explicit-any
  const app = new (ui as any).App() as App;

  let nextId = 1;

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

    return `Count: ${[...app.clients].length}
Total clients:    ${totalClients.toFixed(2)}
Total (- 40 / 2):    ${((totalClients - 40) / 2).toFixed(2)}
Total certificats:    ${totalCertif.toFixed(2)}
Total:    ${(totalClients + totalCertif).toFixed(2)}`;
  };
  app.addClient = function (name, honoraire) {
    if (!name || !honoraire) return;
    const newClients = [...app.clients, {
      id: nextId++,
      name,
      honoraire: parseFloat(honoraire),
    }];
    app.clients = newClients;
    saveClients(newClients);
  };
  app.removeClient = function (id) {
    const newClients = [...app.clients].filter((c) => c.id !== id);
    app.clients = newClients;
    saveClients(newClients);
  };
  app.removeAllClients = function () {
    app.clients = [];
    saveClients([]);
    nextId = 1;
  };
  app.startsWith = function (str, prefix) {
    return str.startsWith(prefix);
  };

  app.clients = loadClients();
  nextId = app.clients.length != 0
    ? (maxInArray([...app.clients].map((client) => client.id)) + 1)
    : nextId;
  await app.run();
}
