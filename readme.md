# Nectr 
## Metadata Layer, CMS, and Visualization Builder

Nectr (short from con*nector* 🙃) - is a serverless CMS-like tool and library for cost-effectively analyzing data and hosting data. This project builds on top of and relies heavily on the [Webiny CMS](https://github.com/webiny/webiny-js), and utilizes modern data analysis (OLAP) and visualization tools, including [DuckDb](https://github.com/duckdb/duckdb), [@observablehq/plot](https://github.com/observablehq/plot), and [Deck.gl](https://github.com/visgl/deck.gl). Output visualizations can be published directly through your Nectr/Webiny instance, or can be ported anywhere you use HTML on the web (including sitebuilders like Squarespace, Wix, etc.) - interactive and viz components are part of the [Dextra](https://github.com/open-spatial-lab/dextra) toolkit, which utilizes the [Lit](https://lit.dev/) framework for building WebComponents.

## Quickstart
1. Install [NodeJS](https://nodejs.org/en). Use your relevant package manager, like Brew on MacOS, if that's how you like to install stuff. Node gives access to Node Package Manager, or *npm*, which allows you to install and manage packages/libraries that we're calling in our code.
2. Install yarn-- a *slightly more different Javascript package manager* that has better features than "npm". Do this in your command line terminal of choice with `npm i -g yarn`.
3. Clone this repo, either through Github desktop or via `git clone https://github.com/open-spatial-lab/nectr.git`.
4. Open the repo folder in your terminal of choice, and run `yarn install`. This will download the relevant packages and make them available.
5. From here, you'll need to run the first deployment to AWS. This will take a while, and at this point, please check out the [Webiny Get Started](https://www.webiny.com/docs/get-started/install-webiny) guide. In most cases, it should be close to as easy as setting your AWS credentials, and running `yarn webiny deploy` to create an instance of nectr on your AWS account.

## Archiving and Restoring IAC files
The following commands can help you manage your webiny and pulumi IAC files. 
|-`yarn archiveWorkspace` zips and uploads your relevant IAC files to S3
|-`yarn restoreWorkspace` gets the most recent zip and expands them into your current repo
You can use the environmnet variable `ARCHIVE_SUFFIX` to suffix your archive files, if managing multiple installations on one AWS account. 
Additionally, you'll need to declare your AWS credentials (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and AWS_SESSION_TOKEN), preferably short-term credentials, and your AWS region (AWS_REGION) as environment`` variables.

## Repo Structure
```
|-apps: Main Webiny stuff lives here, including Nectr extensions
|--api/data: Main analytics layer lambda function. In this folder, `webiny.application.ts` manages the build process
|---src: Source folder for the lambda function. In this folder,`webiny.config.ts` manages some import build config
|----infra: [Infrastructure as Code (IAC)](https://en.wikipedia.org/wiki/Infrastructure_as_code#:~:text=Infrastructure%20as%20code%20(IaC)%20is,configuration%20or%20interactive%20configuration%20tools.) using Webiny's flavor of [Pulumi](https://www.pulumi.com/b/).
|----lambda: A majority of the source code handlers, schemas, and services live here
|----...types, utils: Miscellaneous utility functions and typescript types
|--api/graphql/src/plugins/scaffolds: Custom GraphQL constructrs for the metadata layer
|--theme/pageElements
|---bar,dropdown,map,etc.: Custom [Dextra](https://github.com/open-spatial-lab/dextra) WebComponents, availble in the page builder
|
|-.pulumi: After deploying, your pulumi IAC stack will live here
|-.webiny: Similar to `.pulumi`, after deploying various webiny config will live here
|
|- node-modules: installed dependencies, ignore
|
| config and miscellany (package.json, .yarnrc.yml, etc.)

```

## Featureset and Documentation

Full documentation and feature roadmap description coming soon.