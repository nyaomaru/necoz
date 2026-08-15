import { access } from 'node:fs/promises';
import { resolve } from 'node:path';
import nodemailer from 'nodemailer';

const requireEnvironmentVariable = (name) => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
};

const mailUsername = requireEnvironmentVariable('SCREENSHOT_MAIL_USERNAME');
const mailAppPassword = requireEnvironmentVariable('SCREENSHOT_MAIL_APP_PASSWORD');
const mailRecipient = process.env.SCREENSHOT_MAIL_TO || mailUsername;
const screenshotDirectory = resolve(
  process.env.SCREENSHOT_OUTPUT_DIRECTORY ?? 'artifacts/screenshots',
);
const commitSha = process.env.GITHUB_SHA ?? 'local';
const shortCommitSha = commitSha.slice(0, 7);
const repository = process.env.GITHUB_REPOSITORY;
const serverUrl = process.env.GITHUB_SERVER_URL ?? 'https://github.com';
const runId = process.env.GITHUB_RUN_ID;
const commitUrl = repository ? `${serverUrl}/${repository}/commit/${commitSha}` : undefined;
const workflowUrl =
  repository && runId ? `${serverUrl}/${repository}/actions/runs/${runId}` : undefined;
const attachments = [
  {
    filename: 'necoz-pc.png',
    path: resolve(screenshotDirectory, 'necoz-pc.png'),
  },
  {
    filename: 'necoz-mobile.png',
    path: resolve(screenshotDirectory, 'necoz-mobile.png'),
  },
];

await Promise.all(attachments.map(({ path }) => access(path)));

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: mailUsername,
    pass: mailAppPassword,
  },
});

await transporter.sendMail({
  from: `Necoz Screenshot Bot <${mailUsername}>`,
  to: mailRecipient,
  subject: `[Necoz] main screenshots (${shortCommitSha})`,
  text: [
    'The main branch has been updated.',
    '',
    'PC: 1920 x 1080 (full page)',
    'Mobile: 390 x 844 (full page)',
    commitUrl && `Commit: ${commitUrl}`,
    workflowUrl && `Workflow: ${workflowUrl}`,
  ]
    .filter(Boolean)
    .join('\n'),
  attachments,
});
