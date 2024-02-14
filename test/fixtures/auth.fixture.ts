import crypto from 'crypto';

export const UserFixture = {
  userId: crypto.randomBytes(16).toString('hex'),
  uuid: crypto.randomBytes(16).toString('hex'),
  email: crypto.randomBytes(16).toString('hex'),
  name: crypto.randomBytes(16).toString('hex'),
  lastname: crypto.randomBytes(16).toString('hex'),
  username: crypto.randomBytes(16).toString('hex'),
  bridgeUser: crypto.randomBytes(16).toString('hex'),
  bucket: crypto.randomBytes(16).toString('hex'),
  backupsBucket: crypto.randomBytes(16).toString('hex'),
  root_folder_id: crypto.randomInt(1, 9999),
  sharedWorkspace: false,
  credit: crypto.randomInt(1, 9999),
  mnemonic: crypto.randomBytes(16).toString('hex'),
  privateKey: crypto.randomBytes(16).toString('hex'),
  publicKey: crypto.randomBytes(16).toString('hex'),
  revocationKey: crypto.randomBytes(16).toString('hex'),
  teams: false,
  appSumoDetails: null,
  registerCompleted: true,
  hasReferralsProgram: false,
  createdAt: new Date(),
  avatar: crypto.randomBytes(16).toString('hex'),
  emailVerified: true,
};
