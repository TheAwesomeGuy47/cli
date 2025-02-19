import sinon from 'sinon';
import { createWebDavRequestFixture, createWebDavResponseFixture } from '../../fixtures/webdav.fixture';
import { DriveFileService } from '../../../src/services/drive/drive-file.service';

import { CryptoService } from '../../../src/services/crypto.service';
import { DownloadService } from '../../../src/services/network/download.service';
import { UploadService } from '../../../src/services/network/upload.service';
import { AuthService } from '../../../src/services/auth.service';
import { expect } from 'chai';
import { ConflictError, NotFoundError, UnsupportedMediaTypeError } from '../../../src/utils/errors.utils';
import { SdkManager } from '../../../src/services/sdk-manager.service';
import { NetworkFacade } from '../../../src/services/network/network-facade.service';
import { UserFixture } from '../../fixtures/auth.fixture';
import { PUTRequestHandler } from '../../../src/webdav/handlers/PUT.handler';
import {
  getDriveDatabaseManager,
  getDriveFileDatabaseFixture,
  getDriveFolderDatabaseFixture,
} from '../../fixtures/drive-database.fixture';

describe('PUT request handler', () => {
  const sandbox = sinon.createSandbox();
  const getNetworkMock = () => {
    return SdkManager.instance.getNetwork({
      user: 'user',
      pass: 'pass',
    });
  };

  afterEach(() => {
    sandbox.restore();
  });

  it('When a WebDav client sends a PUT request and it contains a content-length of 0, then it should throw an UnsupportedMediaTypeError', async () => {
    const networkFacade = new NetworkFacade(
      getNetworkMock(),
      UploadService.instance,
      DownloadService.instance,
      CryptoService.instance,
    );
    const sut = new PUTRequestHandler({
      driveFileService: DriveFileService.instance,
      uploadService: UploadService.instance,
      downloadService: DownloadService.instance,
      driveDatabaseManager: getDriveDatabaseManager(),
      authService: AuthService.instance,
      cryptoService: CryptoService.instance,
      networkFacade,
    });

    const request = createWebDavRequestFixture({
      method: 'PUT',
      url: '/file.txt',
      headers: {
        'content-length': '0',
      },
    });

    const response = createWebDavResponseFixture({
      status: sandbox.stub().returns({ send: sandbox.stub() }),
    });

    try {
      await sut.handle(request, response);
      expect(true).to.be.false;
    } catch (error) {
      expect(error).to.be.instanceOf(UnsupportedMediaTypeError);
    }
  });

  it('When a WebDav client sends a PUT request, and the Drive destination folder is not found, then it should throw a ConflictError', async () => {
    const driveDatabaseManager = getDriveDatabaseManager();
    const downloadService = DownloadService.instance;
    const uploadService = UploadService.instance;
    const cryptoService = CryptoService.instance;
    const networkFacade = new NetworkFacade(getNetworkMock(), uploadService, downloadService, cryptoService);
    const sut = new PUTRequestHandler({
      driveFileService: DriveFileService.instance,
      uploadService,
      downloadService,
      driveDatabaseManager,
      authService: AuthService.instance,
      cryptoService,
      networkFacade,
    });

    const request = createWebDavRequestFixture({
      method: 'PUT',
      url: '/file.txt',
      headers: {
        'content-length': '100',
      },
    });

    sandbox.stub(driveDatabaseManager, 'findByRelativePath').resolves(null);
    const response = createWebDavResponseFixture({
      status: sandbox.stub().returns({ send: sandbox.stub() }),
    });

    try {
      await sut.handle(request, response);
      expect(true).to.be.false;
    } catch (error) {
      expect(error).to.be.instanceOf(ConflictError);
    }
  });

  it('When a WebDav client sends a PUT request, and the Drive destination folder is found, then it should upload the file to the folder', async () => {
    const driveDatabaseManager = getDriveDatabaseManager();
    const downloadService = DownloadService.instance;
    const uploadService = UploadService.instance;
    const cryptoService = CryptoService.instance;
    const authService = AuthService.instance;
    const networkFacade = new NetworkFacade(getNetworkMock(), uploadService, downloadService, cryptoService);
    const sut = new PUTRequestHandler({
      driveFileService: DriveFileService.instance,
      uploadService,
      downloadService,
      driveDatabaseManager,
      authService,
      cryptoService,
      networkFacade,
    });

    const request = createWebDavRequestFixture({
      method: 'PUT',
      url: '/file.txt',
      headers: {
        'content-length': '150',
      },
    });

    const driveFileDBObject = getDriveFileDatabaseFixture({ name: 'file' });
    const driveFolderDBObject = getDriveFolderDatabaseFixture();

    sandbox
      .stub(driveDatabaseManager, 'findByRelativePath')
      .withArgs('/file.txt')
      .resolves(driveFileDBObject)
      .withArgs('/')
      .resolves(driveFolderDBObject);
    sandbox
      .stub(authService, 'getAuthDetails')
      .resolves({ mnemonic: 'MNEMONIC', token: 'TOKEN', newToken: 'NEW_TOKEN', user: UserFixture });

    sandbox
      .stub(networkFacade, 'uploadFromStream')
      .resolves([Promise.resolve({ fileId: '09218313209', hash: Buffer.from('test') }), new AbortController()]);
    sandbox.stub(DriveFileService.instance, 'createFile').resolves();
    sandbox.stub(driveDatabaseManager, 'createFile').resolves();

    const response = createWebDavResponseFixture({
      status: sandbox.stub().returns({ send: sandbox.stub() }),
    });

    await sut.handle(request, response);
    expect(response.status.calledWith(200)).to.be.true;
  });
});
