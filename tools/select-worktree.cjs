// Interactive checkout picker for the dev servers.
//
// Lists every git worktree found under <root>/.claude/worktrees and
// <root>/.worktrees, asks which checkout to use, and starts the requested dev
// server there. Entry 0 is the repository root, which is also what a bare
// Enter, an invalid answer, or a non-interactive shell selects.
//
// Usage:
//   node tools/select-worktree.cjs [target] [-- dev server flags]
//
// Arguments after the target (or all arguments, when the first starts with a
// dash) are forwarded to the dev server, so `npm run dev -- --host` reaches Vite.

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { execFileSync, spawn } = require('child_process');

const SCRIPT_ROOT = path.resolve(__dirname, '..');
const WORKTREE_FOLDERS = [path.join('.claude', 'worktrees'), '.worktrees'];
const IS_WINDOWS = process.platform === 'win32';
const NPM_BINARY = IS_WINDOWS ? 'npm.cmd' : 'npm';
const GIT_BINARY = 'git';
const GIT_ENTRY_NAME = '.git';
const NODE_MODULES_FOLDER = 'node_modules';
// One entry per dev server, each holding that server's plain, non-interactive
// command. webgrbl has a single Vite client.
const TARGETS = {
  client: { label: 'client', args: ['run', 'dev:root'] },
};
const DEFAULT_TARGET = 'client';
const ROOT_LABEL = '<root>';
const DETACHED_BRANCH_LABEL = 'detached HEAD';
const WORKTREE_LINE_PREFIX = 'worktree ';
const BRANCH_LINE_PREFIX = 'branch ';
const DETACHED_LINE = 'detached';
const MAX_SELECTION_ATTEMPTS = 3;

const FLAG_PREFIX = '-';
const ARGUMENT_SEPARATOR = '--';
const DOUBLE_QUOTE = '"';

const isFlagArgument = (argument) => Boolean(argument) && argument.startsWith(FLAG_PREFIX);

const getCommandLineArguments = () => process.argv.slice(2).filter((argument) => argument !== ARGUMENT_SEPARATOR);

// An unknown target is a wiring mistake in package.json, not a user choice, so
// it fails loudly instead of falling back to the default.
const resolveTarget = () => {
  const [firstArgument] = getCommandLineArguments();
  const requestedName = firstArgument && !isFlagArgument(firstArgument) ? firstArgument : DEFAULT_TARGET;
  const target = TARGETS[requestedName];

  if (!target) {
    console.error(`Unknown target "${requestedName}" - expected one of: ${Object.keys(TARGETS).join(', ')}.`);
    process.exit(1);
  }

  return target;
};

const getForwardedArguments = () => {
  const commandLineArguments = getCommandLineArguments();
  const forwardedArguments = isFlagArgument(commandLineArguments[0])
    ? commandLineArguments
    : commandLineArguments.slice(1);

  // Windows runs the command through cmd.exe, where a double quote inside a
  // quoted argument cannot be escaped reliably.
  if (IS_WINDOWS && forwardedArguments.some((argument) => argument.includes(DOUBLE_QUOTE))) {
    console.error('Dev server flags must not contain double quotes on Windows.');
    process.exit(1);
  }

  return forwardedArguments;
};

const getGitOutput = (args, cwd) => {
  try {
    return execFileSync(GIT_BINARY, args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  } catch {
    return '';
  }
};

// Windows reports drive-letter and folder casing inconsistently between
// `git worktree list` and `path.join`, so map keys are lowercased there.
const getPathKey = (targetPath) => {
  const resolvedPath = path.resolve(targetPath);

  return IS_WINDOWS ? resolvedPath.toLowerCase() : resolvedPath;
};

// Every worktree shares the main .git directory, so the common dir resolves to
// the main checkout even when this script itself runs from inside a worktree.
const getRepositoryRoot = () => {
  const commonGitDir = getGitOutput(['rev-parse', '--path-format=absolute', '--git-common-dir'], SCRIPT_ROOT).trim();

  return commonGitDir ? path.dirname(commonGitDir) : SCRIPT_ROOT;
};

const getBranchByWorktreePath = (repositoryRoot) => {
  const branchByPath = new Map();
  let currentPath = '';

  for (const line of getGitOutput(['worktree', 'list', '--porcelain'], repositoryRoot).split(/\r?\n/)) {
    if (line.startsWith(WORKTREE_LINE_PREFIX)) {
      currentPath = getPathKey(line.slice(WORKTREE_LINE_PREFIX.length));
    } else if (currentPath && line.startsWith(BRANCH_LINE_PREFIX)) {
      branchByPath.set(currentPath, line.slice(BRANCH_LINE_PREFIX.length).replace(/^refs\/heads\//, ''));
    } else if (currentPath && line === DETACHED_LINE) {
      branchByPath.set(currentPath, DETACHED_BRANCH_LABEL);
    }
  }

  return branchByPath;
};

const getWorktreeChoices = (repositoryRoot, branchByPath) => {
  const choices = [];

  for (const folder of WORKTREE_FOLDERS) {
    const folderPath = path.join(repositoryRoot, folder);

    if (!fs.existsSync(folderPath)) {
      continue;
    }

    for (const entry of fs.readdirSync(folderPath, { withFileTypes: true })) {
      const worktreePath = path.join(folderPath, entry.name);

      // A live worktree always carries a .git file pointing back at the main repository.
      if (!entry.isDirectory() || !fs.existsSync(path.join(worktreePath, GIT_ENTRY_NAME))) {
        continue;
      }

      choices.push({
        label: `${folder.split(path.sep).join('/')}/${entry.name}`,
        cwd: worktreePath,
        branch: branchByPath.get(getPathKey(worktreePath)) || '',
      });
    }
  }

  return choices.sort((first, second) => first.label.localeCompare(second.label));
};

const printChoices = (choices) => {
  choices.forEach((choice, index) => {
    const branchSuffix = choice.branch ? ` (${choice.branch})` : '';

    console.log(`  ${index}) ${choice.label}${branchSuffix}`);
  });
};

const askQuestion = (question) => new Promise((resolve) => {
  const readlineInterface = readline.createInterface({ input: process.stdin, output: process.stdout });
  let hasAnswered = false;

  // Closed stdin (Ctrl+D or a piped EOF) never fires the question callback, so
  // the close event has to resolve the promise with an empty answer.
  const finishQuestion = (answer) => {
    if (hasAnswered) {
      return;
    }

    hasAnswered = true;
    readlineInterface.close();
    resolve(answer.trim());
  };

  readlineInterface.on('close', () => finishQuestion(''));
  readlineInterface.question(question, finishQuestion);
});

const selectChoice = async (target, choices) => {
  const rootChoice = choices[0];

  if (choices.length === 1) {
    return rootChoice;
  }

  if (!process.stdin.isTTY) {
    console.log(`No interactive terminal available - starting the ${target.label} dev server in ${rootChoice.label}.`);

    return rootChoice;
  }

  console.log(`\nWhere should the ${target.label} dev server run?\n`);
  printChoices(choices);

  const lastIndex = choices.length - 1;

  for (let attempt = 0; attempt < MAX_SELECTION_ATTEMPTS; attempt++) {
    const answer = await askQuestion(`\nSelect 0-${lastIndex} [0]: `);

    if (!answer.length) {
      return rootChoice;
    }

    const selectedIndex = Number(answer);

    if (Number.isInteger(selectedIndex) && selectedIndex >= 0 && selectedIndex <= lastIndex) {
      return choices[selectedIndex];
    }

    console.log(`"${answer}" is not a number between 0 and ${lastIndex}.`);
  }

  console.log(`No valid selection - starting the ${target.label} dev server in ${rootChoice.label}.`);

  return rootChoice;
};

const startDevServer = (target, choice, forwardedArguments) => {
  if (!fs.existsSync(path.join(choice.cwd, NODE_MODULES_FOLDER))) {
    console.log(`Warning: ${choice.label} has no node_modules - run "npm install" there first.`);
  }

  console.log(`\nStarting the ${target.label} dev server in ${choice.label}...\n`);

  const npmArguments = forwardedArguments.length
    ? [...target.args, ARGUMENT_SEPARATOR, ...forwardedArguments]
    : target.args;

  // npm.cmd is a batch file, which Node refuses to spawn without a shell. With a shell, Node 24 deprecates an
  // args array (DEP0190), so Windows gets one command string with every forwarded argument quoted.
  const windowsCommand = [NPM_BINARY, ...target.args, ...npmArguments.slice(target.args.length)
    .map((argument) => (argument === ARGUMENT_SEPARATOR ? argument : `${DOUBLE_QUOTE}${argument}${DOUBLE_QUOTE}`))]
    .join(' ');

  const devProcess = IS_WINDOWS
    ? spawn(windowsCommand, { cwd: choice.cwd, stdio: 'inherit', shell: true })
    : spawn(NPM_BINARY, npmArguments, { cwd: choice.cwd, stdio: 'inherit' });

  devProcess.on('error', (error) => {
    console.error(`Could not start the ${target.label} dev server: ${error.message}`);
    process.exitCode = 1;
  });

  devProcess.on('exit', (code, signal) => {
    process.exitCode = signal ? 1 : code || 0;
  });
};

const main = async () => {
  const target = resolveTarget();
  const forwardedArguments = getForwardedArguments();
  const repositoryRoot = getRepositoryRoot();
  const branchByPath = getBranchByWorktreePath(repositoryRoot);
  const rootChoice = {
    label: ROOT_LABEL,
    cwd: repositoryRoot,
    branch: branchByPath.get(getPathKey(repositoryRoot)) || '',
  };
  const choices = [rootChoice, ...getWorktreeChoices(repositoryRoot, branchByPath)];

  startDevServer(target, await selectChoice(target, choices), forwardedArguments);
};

main().catch((error) => {
  console.error(`Worktree selection failed: ${error.message}`);
  process.exitCode = 1;
});
