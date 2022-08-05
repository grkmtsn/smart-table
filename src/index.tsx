import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ReactRouter6Adapter } from "use-query-params/adapters/react-router-6";
import { QueryParamProvider } from "use-query-params";
import { parse, stringify } from "query-string";

import App from "./App";
const container = document.getElementById("root") as HTMLElement;

const root = createRoot(container);

root.render(
  <BrowserRouter>
    <QueryParamProvider
      adapter={ReactRouter6Adapter}
      options={{
        searchStringToObject: parse,
        objectToSearchString: stringify,
      }}
    >
      <App />
    </QueryParamProvider>
  </BrowserRouter>
);
