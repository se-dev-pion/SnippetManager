import * as vscode from "vscode";

import * as addConfig from "./commands/addConfig";
import * as delConfig from "./commands/delConfig";
import * as reOpenConfig from "./commands/reOpenConfig";
import * as compiler from "./commands/compiler";

import * as refreshViews from "./tools/refreshViews";

import * as complete from "./other/complete";
import * as typeComplete from "./other/typeComplete";

export function activate(context: vscode.ExtensionContext) {
  const refresh = new refreshViews.main();
  const loadedView = refresh.loaded();

  addConfig.main(loadedView, refresh, context);
  delConfig.main(loadedView, refresh, context);
  reOpenConfig.main(loadedView, refresh, context);
  compiler.main(context);

  refresh.loaded();

  complete.main(loadedView, context);
  typeComplete.main(context);
}
