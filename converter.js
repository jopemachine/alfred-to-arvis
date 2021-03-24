const plist = require('plist');
const fs = require('fs');
const fse = require('fs-extra');
const chalk = require('chalk');
const _ = require('lodash');
const ActionNodeFinder = require('./actionNodeFinder');
const { supportedActionFormat, supportedInputFormat } = require("./constant");

const convert = async (plistPath, flags) => {
  if (fs.existsSync(plistPath)) {
    const targetPlist = plist.parse(fs.readFileSync(plistPath, "utf8"));
    const {
      bundleid: bundleId,
      category,
      createdby,
      description,
      name,
      readme,
      version,
      webaddress,
    } = targetPlist;

    const result = {
      bundleId,
      category,
      createdby,
      description,
      name,
      readme,
      version,
      webaddress,
      commands: []
    };

    const graph = targetPlist.connections;
    const nodeInfo = targetPlist.objects;
    const actionNodeFinder = new ActionNodeFinder(graph, nodeInfo);

    let inputObjects = [];
    for (const format of supportedInputFormat) {
      inputObjects = [
        ...inputObjects,
        ..._.filter(nodeInfo, (item) => item.type === format),
      ];
    }

    for (const inputObject of inputObjects) {
      const uid = inputObject.uid;
      const { text: title, subtext: subtitle } = inputObject.config;
      const inputType = inputObject.type;
      const type = inputType.split('.')[inputType.split('.').length - 1];
      const keyword = inputObject.config.keyword;
      let script_filter;
      let running_subtext;

      switch (inputType) {
        case 'alfred.workflow.input.keyword': {
          break;
        }

        case 'alfred.workflow.input.scriptfilter': {
          script_filter = inputObject.config.script;
          running_subtext = inputObject.config.runningsubtext;
          break;
        }
      }

      if (graph[uid]) {
        // To do :: fix hack by using loop
        const destUid = graph[uid][0].destinationuid;
        const destNodes = _.filter(nodeInfo, item => item.uid === destUid);

        result.commands.push({
          type,
          command: keyword,
          title,
          subtitle,
          action: actionNodeFinder.getActionNodes(destNodes),
          script_filter,
          running_subtext,
        });
      } else {
        console.error(chalk.red(`'${uid}' doesn't have uid. plist seems to be not valid`));
      }
    }

    await fse.writeJSON(`${name}.json`, result, {
      encoding: 'utf-8',
      spaces: 2,
    });

  } else {
    console.error(chalk.red("plist file not found!"));
    return;
  }
};

module.exports = convert;