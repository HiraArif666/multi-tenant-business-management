import {
  DataTypes,
  Sequelize,
  Model,
} from 'sequelize';

export class File extends Model {
  declare id: number;

  // The name the user's original file had — kept for display/download,
  // separate from the randomized name it's actually stored under.
  declare originalName: string;

  declare fileName: string;

  declare mimeType: string;

  declare size: number;

  // 'images' or 'files' — which uploads/ subfolder this lives in
  declare folder: string;

  // Public URL to fetch this file, relative to the API host
  declare url: string;

  // Which storage backend saved this file ('local', 's3', ...) —
  // lets old records keep working even if we switch providers later
  declare provider: string;

  declare uploadedBy: number | null;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

export function initFileModel(
  sequelize: Sequelize,
): typeof File {
  File.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      originalName: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      fileName: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      mimeType: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      size: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      folder: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      url: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      provider: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'local',
      },

      uploadedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'File',
      tableName: 'files',
      timestamps: true,
    },
  );

  return File;
}