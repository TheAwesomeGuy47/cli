import { DriveFolderItem } from '../../../types/drive.types';
import { DriveFolder } from './drive-folder.domain';
import { DriveFolderModel } from './drive-folder.model';

export class DriveFolderRepository {
  findByRelativePath = async (relativePath: DriveFolder['relativePath']): Promise<DriveFolder | null> => {
    const folder = await DriveFolderModel.findOne({
      where: {
        relativePath,
      },
    });
    return folder ? this.toDomain(folder) : null;
  };

  findById = async (id: DriveFolder['id']): Promise<DriveFolder | null> => {
    const folder = await DriveFolderModel.findOne({
      where: {
        id,
      },
    });
    return folder ? this.toDomain(folder) : null;
  };

  findByParentId = async (parentId: number | null): Promise<DriveFolder | null> => {
    const parentFolder = await DriveFolderModel.findOne({
      where: {
        parentId: parentId ?? -1, // -1 is root as we cannot index null fields
      },
    });
    return parentFolder ? this.toDomain(parentFolder) : null;
  };

  deleteById = (id: DriveFolder['id']): Promise<number> => {
    return DriveFolderModel.destroy({ where: { id } });
  };

  createFolder = async (driveFolderItem: DriveFolderItem, relativePath: string): Promise<DriveFolder> => {
    const driveFolder: DriveFolder = DriveFolder.build({
      ...driveFolderItem,
      relativePath,
    });
    const newFolder = await DriveFolderModel.create({ ...driveFolder.toJSON() });
    return this.toDomain(newFolder);
  };

  toDomain = (model: DriveFolderModel): DriveFolder => {
    const driveFolder = DriveFolder.build({
      ...model.toJSON(),
    });
    return driveFolder;
  };

  static clean = (): Promise<void> => {
    return DriveFolderModel.truncate();
  };
}
