import { plugins } from '@webiny/plugins'
import pageBuilderPlugins from './pageBuilder'
import formBuilderPlugins from './formBuilder'
import headlessCmsPlugins from './headlessCms'
import theme from 'theme'
import welcomeScreenWidgets from './welcomeScreenWidgets'
// Imports plugins created via scaffolding utilities.
import scaffoldsPlugins from './scaffolds'

plugins.register([
  welcomeScreenWidgets,
  /**
   * Page Builder app plugins.
   */
  pageBuilderPlugins,
  /**
   * Form Builder app plugins.
   */
  formBuilderPlugins,
  /**
   * Headless CMS app plugins.
   */
  headlessCmsPlugins,
  /**
   * App theme controls page builder and form builder layouts, styles, etc.
   */
  theme(),
  /**
   * Plugins created via scaffolding utilities.
   */
  scaffoldsPlugins(),

])