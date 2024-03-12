import { Express } from 'express';
import { ConfigService } from '../services/config.service';
import { OPTIONSRequestHandler } from './handlers/OPTIONS.handler';
import { PROPFINDRequestHandler } from './handlers/PROPFIND.handler';
import { webdavLogger } from '../utils/logger.utils';
import bodyParser from 'body-parser';
import { DriveFolderService } from '../services/drive/drive-folder.service';
import { AuthMiddleware } from './middewares/auth.middleware';
import { RequestLoggerMiddleware } from './middewares/request-logger.middleware';
import { DriveRealmManager } from '../services/realms/drive-realm-manager.service';

export class WebDavServer {
  constructor(
    private app: Express,
    private configService: ConfigService,
    private driveFolderService: DriveFolderService,
    private driveRealmManager: DriveRealmManager,
  ) {}

  private registerMiddlewares = () => {
    this.app.use(bodyParser.text({ type: ['application/xml', 'text/xml'] }));
    this.app.use(
      RequestLoggerMiddleware({
        enable: false,
      }),
    );
    this.app.use(AuthMiddleware(ConfigService.instance));
  };

  private registerHandlers = () => {
    this.app.options('*', new OPTIONSRequestHandler().handle);
    this.app.propfind(
      '*',
      new PROPFINDRequestHandler(
        { debug: true },
        {
          driveFolderService: this.driveFolderService,
          driveRealmManager: this.driveRealmManager,
        },
      ).handle,
    );
  };

  async start() {
    const port = this.configService.get('WEBDAV_SERVER_PORT');
    this.app.disable('x-powered-by');

    this.registerMiddlewares();
    this.registerHandlers();

    this.app.listen(port, () => {
      webdavLogger.info(`Internxt WebDav server listening at http://localhost:${port}`);
    });
  }
}
