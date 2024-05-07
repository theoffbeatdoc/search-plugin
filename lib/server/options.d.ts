/// <reference path="../../src/docusaurus-plugin-search-local.d.ts" />
import type { Options, PluginOptions } from "docusaurus-plugin-search-local";
import { Joi } from "@docusaurus/utils-validation";
import type { OptionValidationContext } from "@docusaurus/types";
export declare const DEFAULT_OPTIONS: Omit<PluginOptions, "id">;
export declare const OptionsSchema: Joi.ObjectSchema<PluginOptions>;
export declare function validateOptions({ validate, options, }: OptionValidationContext<Options, PluginOptions>): PluginOptions;
