/// <reference path="../../src/docusaurus-plugin-search-local.d.ts" />
import { LoadContext, Plugin } from "@docusaurus/types";
import type { PluginOptions } from "docusaurus-plugin-search-local";
export default function DocusaurusSearchLocalPlugin(context: LoadContext, options: PluginOptions): Plugin;
export { validateOptions } from "./options";
