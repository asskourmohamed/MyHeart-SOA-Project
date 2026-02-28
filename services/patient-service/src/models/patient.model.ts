import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface PatientAttributes {
  id: string;
  userId: string; // Référence à l'utilisateur dans Auth Service
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other';
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  bloodType?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  allergies?: string;
  chronicDiseases?: string;
  currentMedications?: string;
  medicalHistory?: string;
  insuranceProvider?: string;
  insuranceNumber?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PatientCreationAttributes extends Optional<PatientAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Patient extends Model<PatientAttributes, PatientCreationAttributes> implements PatientAttributes {
  public id!: string;
  public userId!: string;
  public firstName!: string;
  public lastName!: string;
  public dateOfBirth!: Date;
  public gender!: 'male' | 'female' | 'other';
  public email!: string;
  public phone!: string;
  public address!: string;
  public city!: string;
  public postalCode!: string;
  public country!: string;
  public emergencyContactName!: string;
  public emergencyContactPhone!: string;
  public bloodType?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  public allergies?: string;
  public chronicDiseases?: string;
  public currentMedications?: string;
  public medicalHistory?: string;
  public insuranceProvider?: string;
  public insuranceNumber?: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Patient.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    dateOfBirth: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    gender: {
      type: DataTypes.ENUM('male', 'female', 'other'),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    postalCode: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    country: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'France',
    },
    emergencyContactName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    emergencyContactPhone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    bloodType: {
      type: DataTypes.ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'),
      allowNull: true,
    },
    allergies: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    chronicDiseases: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    currentMedications: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    medicalHistory: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    insuranceProvider: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    insuranceNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'patients',
  }
);

export default Patient;